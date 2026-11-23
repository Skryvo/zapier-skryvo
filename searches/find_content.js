const { url } = require('../lib/api');

module.exports = {
  key: 'find_content',
  noun: 'Content',
  display: {
    label: 'Find Content',
    description: 'Finds earlier articles, posts, emails, listings or ads, newest first.',
  },
  operation: {
    inputFields: [
      {
        key: 'kind',
        label: 'Kind',
        required: true,
        choices: { ad: 'Ad', article: 'Article', email: 'Email', listing: 'Listing', post: 'Post' },
      },
      { key: 'title', label: 'Title Contains', helpText: 'Only items whose title contains these words.' },
    ],
    perform: async (z, bundle) => {
      const { kind, title } = bundle.inputData;
      const items = (await z.request({ url: url('/content'), params: { kind, limit: 50 } })).data.items;
      const words = (title || '').trim().toLowerCase();
      return words ? items.filter((i) => (i.title || '').toLowerCase().includes(words)) : items;
    },
    sample: {
      id: 'gen_a7c2f0',
      kind: 'article',
      title: 'How to choose a coffee grinder for home',
      brand_id: 'bv_3c9d0e',
      created_at: '2026-11-23T10:02:00+00:00',
    },
    outputFields: [
      { key: 'id', label: 'ID' },
      { key: 'kind', label: 'Kind' },
      { key: 'title', label: 'Title' },
      { key: 'created_at', label: 'Created At', type: 'datetime' },
    ],
  },
};
