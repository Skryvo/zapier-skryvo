const { url } = require('../lib/api');

const listTrigger = (key, noun, label, description, perform, sample) => ({
  key,
  noun,
  display: { label, description, hidden: true },
  operation: { perform, sample },
});

const brands = async (z) => (await z.request({ url: url('/brands') })).data.brands;

const channelsOf = (kind) => async (z) =>
  (await z.request({ url: url('/channels') })).data.channels
    .filter((c) => c.kind === kind && !c.needs_reconnect)
    .map((c) => ({ ...c, label: `${c.name} (${c.platform})` }));

const platforms = async (z) =>
  (await z.request({ url: url('/platforms') })).data.platforms
    .filter((p) => p.kind === 'social')
    .map((p) => ({ id: p.platform, name: p.name }));

const articles = async (z) =>
  (await z.request({ url: url('/content'), params: { kind: 'article', limit: 50 } })).data.items;

module.exports = [
  listTrigger('brand_list', 'Brand', 'List Brands', 'Triggers when a brand is added.', brands, {
    id: 'bv_3c9d0e',
    name: 'Northside Coffee',
    is_default: true,
  }),
  listTrigger('channel_list', 'Channel', 'List Social Channels', 'Triggers when a social channel is connected.', channelsOf('social'), {
    id: 'conn_8f2e1a',
    platform: 'linkedin',
    name: 'Northside Coffee',
    label: 'Northside Coffee (linkedin)',
  }),
  listTrigger('blog_list', 'Blog', 'List Blogs', 'Triggers when a blog is connected.', channelsOf('blog'), {
    id: 'conn_wp41',
    platform: 'wordpress',
    name: 'Northside Journal',
    label: 'Northside Journal (wordpress)',
  }),
  listTrigger('platform_list', 'Platform', 'List Platforms', 'Triggers when Skryvo adds a platform.', platforms, {
    id: 'linkedin',
    name: 'LinkedIn',
  }),
  listTrigger('article_list', 'Article', 'List Articles', 'Triggers when an article is written or imported.', articles, {
    id: 'gen_a7c2f0',
    kind: 'article',
    title: 'How to choose a coffee grinder for home',
    brand_id: 'bv_3c9d0e',
    created_at: '2026-11-23T10:02:00+00:00',
  }),
];
