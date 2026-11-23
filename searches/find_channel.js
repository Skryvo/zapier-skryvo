const { url } = require('../lib/api');

module.exports = {
  key: 'find_channel',
  noun: 'Channel',
  display: {
    label: 'Find Channel',
    description: 'Finds connected channels by platform or name, with what each one takes.',
  },
  operation: {
    inputFields: [
      { key: 'platform', label: 'Platform', dynamic: 'platform_list.id.name' },
      { key: 'name', label: 'Name Contains' },
    ],
    perform: async (z, bundle) => {
      const { platform, name } = bundle.inputData;
      const words = (name || '').trim().toLowerCase();
      return (await z.request({ url: url('/channels') })).data.channels.filter(
        (c) => (!platform || c.platform === platform) && (!words || (c.name || '').toLowerCase().includes(words)),
      );
    },
    sample: {
      id: 'conn_8f2e1a',
      platform: 'linkedin',
      name: 'Northside Coffee',
      brand_ids: ['bv_3c9d0e'],
      kind: 'social',
      needs_reconnect: false,
      can: { takes: 'posts', words: 3000, pictures: true, poll: true, link: 'in the words' },
    },
    outputFields: [
      { key: 'id', label: 'Channel ID' },
      { key: 'platform', label: 'Platform' },
      { key: 'name', label: 'Name' },
      { key: 'needs_reconnect', label: 'Needs Reconnect', type: 'boolean' },
      { key: 'can__words', label: 'Word Limit', type: 'integer' },
    ],
  },
};
