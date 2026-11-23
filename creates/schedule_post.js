const { url, given, brandField } = require('../lib/api');

module.exports = {
  key: 'schedule_post',
  noun: 'Post',
  display: {
    label: 'Schedule a Post',
    description: 'Schedules approved text to connected channels. Use it only after the person approved the words.',
  },
  operation: {
    inputFields: [
      { key: 'text', label: 'Text', type: 'text', required: true, helpText: 'The exact words the person approved.' },
      {
        key: 'channel_ids',
        label: 'Channels',
        required: true,
        list: true,
        dynamic: 'channel_list.id.label',
        helpText: 'Connected social channels to post to.',
      },
      {
        key: 'at',
        label: 'Publish At',
        type: 'datetime',
        helpText: 'Moves to the next quarter hour. Left empty, the post goes out in about five minutes.',
      },
      { key: 'image_url', label: 'Image URL', helpText: 'One picture for every channel, as a full https address.' },
      { key: 'link', label: 'Link', helpText: "A web page the post points to: a pin's destination, else after the words." },
      brandField,
      {
        key: 'tiktok_privacy',
        label: 'TikTok Audience',
        choices: {
          PUBLIC_TO_EVERYONE: 'Everyone',
          FOLLOWER_OF_CREATOR: 'Followers',
          MUTUAL_FOLLOW_FRIENDS: 'Friends',
          SELF_ONLY: 'Only me',
        },
        helpText: 'Required for a TikTok channel; TikTok asks the person to choose it for every post.',
      },
    ],
    perform: async (z, bundle) => {
      const d = bundle.inputData;
      const answer = await z.request({
        url: url('/posts'),
        method: 'POST',
        body: given({
          text: d.text,
          channel_ids: d.channel_ids,
          at: d.at,
          image_url: d.image_url,
          link: d.link,
          brand_id: d.brand_id,
          tiktok: d.tiktok_privacy ? { privacy: d.tiktok_privacy } : undefined,
        }),
      });
      const posts = answer.data.posts;
      return { ...posts[0], posts };
    },
    sample: {
      id: 'c1a2b3c4d5',
      platform: 'linkedin',
      channel_id: 'conn_8f2e1a',
      date: '2026-11-24',
      time: '09:00',
      status: 'scheduled',
      auto_publish: true,
      text: 'We just opened our new studio in Leeds. Come say hello this Saturday.',
      open_in_skryvo: 'https://app.skryvo.ai/calendar?date=2026-11-24',
      posts: [{ id: 'c1a2b3c4d5', platform: 'linkedin', channel_id: 'conn_8f2e1a', status: 'scheduled' }],
    },
    outputFields: [
      { key: 'id', label: 'Post ID' },
      { key: 'platform', label: 'Platform' },
      { key: 'date', label: 'Date' },
      { key: 'time', label: 'Time' },
      { key: 'status', label: 'Status' },
      { key: 'open_in_skryvo', label: 'Open in Skryvo' },
    ],
  },
};
