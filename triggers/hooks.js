const { url } = require('../lib/api');
const { signed } = require('../lib/signature');

const subscribe = (event) => async (z, bundle) =>
  (await z.request({ url: url('/webhooks'), method: 'POST', body: { url: bundle.targetUrl, events: [event] } })).data;

const unsubscribe = async (z, bundle) => {
  const answer = await z.request({
    url: url(`/webhooks/${encodeURIComponent(bundle.subscribeData.id)}`),
    method: 'DELETE',
    skipThrowForStatus: true,
  });
  if (answer.status !== 204 && answer.status !== 404) answer.throwForStatus();
  return {};
};

const receive = async (z, bundle) => {
  const raw = bundle.rawRequest || {};
  const headers = raw.headers || {};
  if (!signed(raw.content, headers['Http-Skryvo-Signature'], (bundle.subscribeData || {}).secret)) {
    throw new z.errors.HaltedError('This delivery is not signed with the endpoint\'s secret, so it was ignored.');
  }
  return [JSON.parse(raw.content)];
};

const event = (id, type, data, created = '2026-11-24T09:00:41+00:00') => ({ id, type, created, test: false, data });

const POST = {
  id: 'c1a2b3c4d5',
  platform: 'linkedin',
  channel_id: 'conn_8f2e1a',
  date: '2026-11-24',
  time: '09:00',
  status: 'posted',
  reason: null,
  awaiting_approval: false,
  reviewer_approval: null,
  auto_publish: true,
  text: 'We just opened our new studio in Leeds. Come say hello this Saturday.',
  topic: 'New studio opening',
  written: true,
  publish_error: null,
  posted_url: 'https://www.linkedin.com/feed/update/urn:li:share:7262000000000000000',
  open_in_skryvo: 'https://app.skryvo.ai/calendar?date=2026-11-24',
};

const postFields = [
  { key: 'id', label: 'Event ID' },
  { key: 'type', label: 'Event' },
  { key: 'created', label: 'Created At', type: 'datetime' },
  { key: 'test', label: 'Test Delivery', type: 'boolean' },
  { key: 'data__id', label: 'Post ID' },
  { key: 'data__platform', label: 'Platform' },
  { key: 'data__channel_id', label: 'Channel ID' },
  { key: 'data__status', label: 'Status' },
  { key: 'data__text', label: 'Text' },
  { key: 'data__posted_url', label: 'Posted URL' },
  { key: 'data__publish_error', label: 'Publish Error' },
  { key: 'data__reason', label: 'Reason' },
  { key: 'data__open_in_skryvo', label: 'Open in Skryvo' },
];

const recentPosts = (status, type) => async (z) => {
  const posts = (await z.request({ url: url('/posts'), params: { days: 1 } })).data.posts;
  return posts
    .filter((p) => p.status === status)
    .map((p) => event(`sample_${p.id}`, type, p, `${p.date}T${p.time}:00+00:00`));
};

const recentArticles = async (z) =>
  (await z.request({ url: url('/content'), params: { kind: 'article', limit: 3 } })).data.items.map((a) =>
    event(`sample_${a.id}`, 'article.ready', { article_id: a.id, generation_id: a.id, title: a.title }, a.created_at),
  );

const recentResults = async (z) =>
  (await z.request({ url: url('/results'), params: { days: 7 } })).data.top_posts.slice(0, 3).map((p) =>
    event(
      `sample_${p.id}`,
      'results.ready',
      {
        post_id: null,
        publication_id: p.id,
        platform: p.platform,
        url: p.url,
        reach: p.reach,
        reach_kind: p.reachKind,
        engagements: p.engagements,
        clicks: p.clicks,
        collected_at: p.collectedAt,
      },
      p.collectedAt,
    ),
  );

const hook = ({ type, noun, label, description, list, sample, outputFields }) => ({
  key: type.replace('.', '_'),
  noun,
  display: { label, description },
  operation: {
    type: 'hook',
    performSubscribe: subscribe(type),
    performUnsubscribe: unsubscribe,
    perform: receive,
    performList: list,
    sample,
    outputFields,
  },
});

const triggers = [
  hook({
    type: 'post.published',
    noun: 'Post',
    label: 'Post Published',
    description: 'Triggers when a scheduled post goes live on its channel.',
    list: recentPosts('posted', 'post.published'),
    sample: event('evt_5f0c2a9b1d3e4f5061728394', 'post.published', POST),
    outputFields: postFields,
  }),
  hook({
    type: 'post.failed',
    noun: 'Post',
    label: 'Post Failed',
    description: 'Triggers when a scheduled post could not go out, with the reason in plain words.',
    list: recentPosts('didnt_post', 'post.failed'),
    sample: event('evt_7a1b2c3d4e5f60718293a4b5', 'post.failed', {
      ...POST,
      status: 'didnt_post',
      auto_publish: false,
      posted_url: null,
      reason: 'LinkedIn needs reconnecting in Skryvo under Settings › Connected Accounts.',
      publish_error: 'LinkedIn needs reconnecting in Skryvo under Settings › Connected Accounts.',
    }),
    outputFields: postFields,
  }),
  hook({
    type: 'article.ready',
    noun: 'Article',
    label: 'Article Ready',
    description: 'Triggers when an article written through the API is finished.',
    list: recentArticles,
    sample: event('evt_9c8b7a6f5e4d3c2b1a098765', 'article.ready', {
      article_id: 'pl_91ab3e',
      generation_id: 'gen_a7c2f0',
      title: 'How to choose a coffee grinder for home',
      words: 1512,
      score: 88,
      open_in_skryvo: 'https://app.skryvo.ai/generate/blog/gen_a7c2f0',
    }),
    outputFields: [
      { key: 'id', label: 'Event ID' },
      { key: 'created', label: 'Created At', type: 'datetime' },
      { key: 'data__article_id', label: 'Article ID' },
      { key: 'data__generation_id', label: 'Generation ID' },
      { key: 'data__title', label: 'Title' },
      { key: 'data__words', label: 'Words', type: 'integer' },
      { key: 'data__score', label: 'Score', type: 'integer' },
      { key: 'data__open_in_skryvo', label: 'Open in Skryvo' },
    ],
  }),
  hook({
    type: 'article.failed',
    noun: 'Article',
    label: 'Article Failed',
    description: 'Triggers when an article written through the API could not be finished; it is not charged.',
    list: async () => [],
    sample: event('evt_1d2c3b4a5f6e7d8c9b0a1f2e', 'article.failed', {
      article_id: 'pl_91ab3e',
      error: 'The article stopped before it finished.',
      charged: false,
    }),
    outputFields: [
      { key: 'id', label: 'Event ID' },
      { key: 'created', label: 'Created At', type: 'datetime' },
      { key: 'data__article_id', label: 'Article ID' },
      { key: 'data__error', label: 'Error' },
    ],
  }),
  hook({
    type: 'results.ready',
    noun: 'Result',
    label: 'Results Ready',
    description: "Triggers when Skryvo reads a published post's numbers at 1 hour, 1 day, 7, 30, 60 or 90 days.",
    list: recentResults,
    sample: event(
      'evt_2b3c4d5e6f708192a3b4c5d6',
      'results.ready',
      {
        post_id: 'c1a2b3c4d5',
        publication_id: 'pub_4e7a',
        platform: 'linkedin',
        url: 'https://www.linkedin.com/feed/update/urn:li:share:7262000000000000000',
        milestone: '24h',
        reach: 812,
        reach_kind: 'impressions',
        engagements: 37,
        clicks: 9,
        collected_at: '2026-11-25T09:00:00+00:00',
      },
      '2026-11-25T09:00:02+00:00',
    ),
    outputFields: [
      { key: 'id', label: 'Event ID' },
      { key: 'data__post_id', label: 'Post ID' },
      { key: 'data__platform', label: 'Platform' },
      { key: 'data__url', label: 'URL' },
      { key: 'data__milestone', label: 'Milestone' },
      { key: 'data__reach', label: 'Reach', type: 'integer' },
      { key: 'data__engagements', label: 'Engagements', type: 'integer' },
      { key: 'data__clicks', label: 'Clicks', type: 'integer' },
      { key: 'data__collected_at', label: 'Collected At', type: 'datetime' },
    ],
  }),
];

module.exports = { triggers };
