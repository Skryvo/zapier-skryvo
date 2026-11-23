const { signed } = require('./signature');
const { url } = require('./api');

/** Starts a long call with Zapier's callback address; the step waits until Skryvo posts the answer there. */
const start = (path) => async (z, bundle, body) => {
  const callbackUrl = z.generateCallbackUrl();
  if (!callbackUrl) {
    throw new z.errors.Error('Zapier gave this step no address to answer to, so nothing was started.', 'NoCallback', 500);
  }
  const job = (await z.request({ url: url(path), method: 'POST', body: { ...body, callback_url: callbackUrl } })).data;
  return { job_id: job.job_id, secret: job.secret };
};

/** The call's own answer once Skryvo posts the finished job; a failed job fails the step. */
const resume = async (z, bundle) => {
  const raw = bundle.rawRequest || {};
  const headers = raw.headers || {};
  const { job_id: jobId, secret } = bundle.outputData || {};
  if (!signed(raw.content, headers['Http-Skryvo-Signature'], secret)) {
    throw new z.errors.Error('The answer to this step was not signed by Skryvo, so it was not used.', 'Unsigned', 401);
  }
  const event = JSON.parse(raw.content);
  const job = event.data || {};
  if (job.job_id !== jobId) {
    throw new z.errors.Error('The answer to this step belongs to another job, so it was not used.', 'WrongJob', 400);
  }
  if (event.type === 'job.failed' || job.status === 'failed') {
    const detail = (job.error && job.error.detail) || 'Skryvo could not finish this.';
    const charged = /charged/i.test(detail) ? '' : ' Nothing was charged.';
    throw new z.errors.Error(`${detail}${charged}`, 'JobFailed', (job.error && job.error.status) || 500);
  }
  return { ...job.answer, job_id: jobId };
};

module.exports = { start, resume };
