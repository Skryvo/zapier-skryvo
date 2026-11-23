const addKey = (request, z, bundle) => {
  if (bundle.authData.api_key) request.headers.Authorization = `Bearer ${bundle.authData.api_key}`;
  request.headers.Accept = 'application/json';
  return request;
};

/** Turns Skryvo's refusals into errors that carry its own sentence. */
const explain = (response, z) => {
  if (response.status < 400 || response.request.skipThrowForStatus) return response;
  let body;
  try {
    body = JSON.parse(response.content || '{}');
  } catch {
    body = {};
  }
  const fields = Array.isArray(body.details) ? body.details.map((d) => `${d.field}: ${d.message}`).join('; ') : '';
  const said = typeof body.detail === 'string' ? body.detail : fields ? `Check the request: ${fields}.` : body.message;
  const message = said || `Skryvo answered ${response.status}.`;
  if (response.status === 401) {
    throw new z.errors.ExpiredAuthError(`${message} Create a new key in Skryvo under Settings › API & agents.`);
  }
  throw new z.errors.Error(message, response.status === 422 ? 'Refused' : 'SkryvoError', response.status);
};

module.exports = { addKey, explain };
