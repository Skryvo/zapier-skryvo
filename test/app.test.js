const { test, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const nock = require('nock');
const zapier = require('zapier-platform-core');
const App = require('../index');
const spec = require('./openapi.json');

const appTester = zapier.createAppTester(App);
const KEY = 'sk_skryvo_zap_test';
const API = nock.bind(null, 'https://api.skryvo.ai');
const P = '/api/v1/agent';
const authData = { api_key: KEY };

const example = (method, path) => {
  const op = spec.paths[`${P}${path}`][method];
  const code = Object.keys(op.responses).find((c) => c.startsWith('2'));
  return op.responses[code].content['application/json'].example;
};

beforeEach(() => nock.disableNetConnect());
afterEach(() => {
  const pending = nock.pendingMocks();
  nock.cleanAll();
  nock.enableNetConnect();
  assert.deepEqual(pending, [], 'every mocked call was made');
});

test('the connection test sends the key and labels the connection with the email', async () => {
  API({ reqheaders: { authorization: `Bearer ${KEY}` } }).get(`${P}/me`).reply(200, example('get', '/me'));
  const me = await appTester(App.authentication.test, { authData });
  assert.equal(me.email, 'sam@example.com');
  assert.equal(App.authentication.connectionLabel, '{{email}}');
});

test('a revoked key asks the person to reconnect', async () => {
  API().get(`${P}/me`).reply(401, { detail: "Send a live Skryvo API key as 'Authorization: Bearer sk_skryvo_…'." });
  await assert.rejects(appTester(App.authentication.test, { authData }), (error) => {
    assert.equal(error.name, 'ExpiredAuthError');
    assert.match(error.message, /Settings › API & agents/);
    return true;
  });
});

test('Write a Post drafts without pictures and sends only what was filled in', async () => {
  let sent;
  API()
    .post(`${P}/drafts`, (body) => (sent = body))
    .reply(200, example('post', '/drafts'));
  const out = await appTester(App.creates.write_post.operation.perform, {
    authData,
    inputData: { topic: 'Our new studio opens Saturday', platforms: ['linkedin'], tone: '', hashtags: [] },
  });
  assert.deepEqual(sent, { topic: 'Our new studio opens Saturday', platforms: ['linkedin'], pictures: false });
  assert.equal(out.status, 'written');
});

test("a refusal fails the step with Skryvo's own sentence", async () => {
  API().post(`${P}/posts`).reply(422, { detail: 'That time has passed. Pick a time in the future.' });
  await assert.rejects(
    appTester(App.creates.schedule_post.operation.perform, {
      authData,
      inputData: { text: 'Hi', channel_ids: ['conn_8f2e1a'], at: '2020-01-01T09:00:00Z' },
    }),
    /That time has passed\. Pick a time in the future\./,
  );
});

test('a field check failure names the field', async () => {
  API()
    .post(`${P}/emails`)
    .reply(422, { error: 'validation_error', message: 'Request validation failed', details: [{ field: 'about', message: 'String should have at least 3 characters' }] });
  await assert.rejects(
    appTester(App.creates.write_email.operation.perform, { authData, inputData: { about: 'x', email_type: 'welcome' } }),
    /about: String should have at least 3 characters/,
  );
});

test('Schedule a Post sends the approved text, channels, time and TikTok audience', async () => {
  let sent;
  API()
    .post(`${P}/posts`, (body) => (sent = body))
    .reply(201, example('post', '/posts'));
  const out = await appTester(App.creates.schedule_post.operation.perform, {
    authData,
    inputData: {
      text: 'Doors open at nine.',
      channel_ids: ['conn_8f2e1a', 'conn_tt'],
      at: '2026-11-24T09:00:00+00:00',
      tiktok_privacy: 'SELF_ONLY',
      image_url: '',
    },
  });
  assert.deepEqual(sent, {
    text: 'Doors open at nine.',
    channel_ids: ['conn_8f2e1a', 'conn_tt'],
    at: '2026-11-24T09:00:00+00:00',
    tiktok: { privacy: 'SELF_ONLY' },
  });
  assert.equal(out.id, 'c1a2b3c4d5');
  assert.equal(out.posts.length, 1);
});

test('Publish an Article sends the draft choice as a boolean', async () => {
  let sent;
  API()
    .post(`${P}/articles/gen_a7c2f0/publish`, (body) => (sent = body))
    .reply(201, example('post', '/articles/{article_id}/publish'));
  await appTester(App.creates.publish_article.operation.perform, {
    authData,
    inputData: { article_id: 'gen_a7c2f0', channel_id: 'conn_wp41', as_draft: 'false', at: '2026-11-24T09:00:00Z' },
  });
  assert.deepEqual(sent, { channel_id: 'conn_wp41', as_draft: false, at: '2026-11-24T09:00:00Z' });
});

test('Find Content and Find Channel filter what Skryvo lists', async () => {
  API().get(`${P}/content`).query({ kind: 'article', limit: 50 }).reply(200, example('get', '/content'));
  const found = await appTester(App.searches.find_content.operation.perform, {
    authData,
    inputData: { kind: 'article', title: 'grinder' },
  });
  assert.equal(found.length, 1);
  API().get(`${P}/channels`).reply(200, example('get', '/channels'));
  const none = await appTester(App.searches.find_channel.operation.perform, {
    authData,
    inputData: { platform: 'x' },
  });
  assert.deepEqual(none, []);
});

test('dropdowns list brands, social channels and platforms', async () => {
  API().get(`${P}/brands`).reply(200, example('get', '/brands'));
  API().get(`${P}/channels`).reply(200, example('get', '/channels'));
  API().get(`${P}/platforms`).reply(200, example('get', '/platforms'));
  const brands = await appTester(App.triggers.brand_list.operation.perform, { authData });
  const channels = await appTester(App.triggers.channel_list.operation.perform, { authData });
  const platforms = await appTester(App.triggers.platform_list.operation.perform, { authData });
  assert.ok(brands[0].id && brands[0].name);
  assert.equal(channels[0].label, 'Northside Coffee (linkedin)');
  assert.ok(platforms.every((p) => p.id && p.name));
});

test('turning a Zap on subscribes its URL to one event, and off unsubscribes', async () => {
  let sent;
  API()
    .post(`${P}/webhooks`, (body) => (sent = body))
    .reply(201, { id: 'wh_1', url: 'https://hooks.zapier.com/x', events: ['post.published'], secret: 'whsec_1', status: 'active' });
  const made = await appTester(App.triggers.post_published.operation.performSubscribe, {
    authData,
    targetUrl: 'https://hooks.zapier.com/x',
  });
  assert.deepEqual(sent, { url: 'https://hooks.zapier.com/x', events: ['post.published'] });
  assert.equal(made.secret, 'whsec_1');
  API().delete(`${P}/webhooks/wh_1`).reply(204);
  await appTester(App.triggers.post_published.operation.performUnsubscribe, { authData, subscribeData: made });
  API().delete(`${P}/webhooks/wh_1`).reply(404, { detail: 'No webhook wh_1.' });
  await appTester(App.triggers.post_published.operation.performUnsubscribe, { authData, subscribeData: made });
});

const BODY = JSON.stringify({ id: 'evt_1', type: 'post.published', created: '2026-11-24T09:00:41+00:00', test: false, data: { id: 'p1' } });
const sign = (body, secret, t) => `t=${t},v1=${crypto.createHmac('sha256', secret).update(`${t}.${body}`).digest('hex')}`;

test('a signed delivery becomes one Zap run with the event', async () => {
  const t = Math.floor(Date.now() / 1000);
  const out = await appTester(App.triggers.post_published.operation.perform, {
    authData,
    subscribeData: { id: 'wh_1', secret: 'whsec_1' },
    rawRequest: { headers: { 'Http-Skryvo-Signature': sign(BODY, 'whsec_1', t) }, content: BODY },
    cleanedRequest: JSON.parse(BODY),
  });
  assert.equal(out.length, 1);
  assert.equal(out[0].data.id, 'p1');
});

test('an unsigned or forged delivery starts nothing', async () => {
  const t = Math.floor(Date.now() / 1000);
  for (const header of [undefined, sign(BODY, 'whsec_other', t), sign(BODY, 'whsec_1', t - 301)]) {
    await assert.rejects(
      appTester(App.triggers.post_published.operation.perform, {
        authData,
        subscribeData: { id: 'wh_1', secret: 'whsec_1' },
        rawRequest: { headers: header ? { 'Http-Skryvo-Signature': header } : {}, content: BODY },
      }),
      (error) => error.name === 'HaltedError',
    );
  }
});

test('the polling sample for Post Published is today\'s posted posts, shaped like a delivery', async () => {
  const posted = { ...example('post', '/posts').posts[0], status: 'posted' };
  API().get(`${P}/posts`).query({ days: 1 }).reply(200, { posts: [posted, { ...posted, id: 'x', status: 'scheduled' }] });
  const out = await appTester(App.triggers.post_published.operation.performList, { authData });
  assert.equal(out.length, 1);
  assert.deepEqual(Object.keys(out[0]), ['id', 'type', 'created', 'test', 'data']);
  assert.equal(out[0].type, 'post.published');
});

test('every request the app makes is a route in the published spec', () => {
  const routes = new Set(Object.keys(spec.paths).map((p) => p.slice(P.length).replace(/\{[^}]+\}/g, '{}')));
  const source = ['creates', 'searches', 'triggers', '.'].flatMap((dir) =>
    require('node:fs')
      .readdirSync(`${__dirname}/../${dir}`)
      .filter((f) => f.endsWith('.js'))
      .map((f) => require('node:fs').readFileSync(`${__dirname}/../${dir}/${f}`, 'utf8')),
  );
  const used = source.flatMap((text) =>
    [...text.matchAll(/url\(\s*[`'](\/[^`']*)[`']/g)].map((m) => m[1].replace(/\$\{[^}]*\)\}|\$\{[^}]*\}/g, '{}')),
  );
  for (const path of used) {
    assert.ok(routes.has(path) || path.startsWith('/webhooks'), `${path} is not in the spec`);
  }
  assert.ok(used.length >= 10);
});
