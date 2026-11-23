const { given, brandField } = require('../lib/api');
const { start, resume } = require('../lib/later');

const draft = start('/drafts');

module.exports = {
  key: 'write_post',
  noun: 'Post',
  display: {
    label: 'Write a Post',
    description:
      "Drafts a post per platform in the brand's voice, with a picture each if asked. Schedules nothing; add Schedule a Post after the person approves.",
  },
  operation: {
    inputFields: [
      {
        key: 'topic',
        label: 'Topic',
        required: true,
        helpText: 'What the post is about, up to 200 characters: the news, the offer, who it is for.',
      },
      {
        key: 'platforms',
        label: 'Platforms',
        required: true,
        list: true,
        dynamic: 'platform_list.id.name',
        helpText: 'Up to four. One post is written for each.',
      },
      brandField,
      { key: 'tone', label: 'Tone', helpText: "For example friendly or professional. Left empty, the brand's tone." },
      { key: 'language', label: 'Language', helpText: 'A language code such as en or de.' },
      { key: 'audience', label: 'Audience', helpText: 'Who the post is for.' },
      { key: 'call_to_action', label: 'Call to Action' },
      { key: 'hashtags', label: 'Hashtags', list: true, helpText: 'Up to ten, without the #.' },
      { key: 'link', label: 'Link', helpText: 'A web page the post points to.' },
      {
        key: 'pictures',
        label: 'Pictures',
        type: 'boolean',
        default: 'false',
        helpText: "Yes designs a picture in the brand's kept look with each post, using image credits.",
      },
    ],
    perform: async (z, bundle) => {
      const d = bundle.inputData;
      return draft(
        z,
        bundle,
        given({
          topic: d.topic,
          platforms: d.platforms,
          brand_id: d.brand_id,
          tone: d.tone,
          language: d.language,
          audience: d.audience,
          call_to_action: d.call_to_action,
          hashtags: d.hashtags,
          link: d.link,
          pictures: d.pictures === true || d.pictures === 'true',
        }),
      );
    },
    performResume: resume,
    sample: {
      status: 'written',
      topic: 'Our new studio opens Saturday',
      brand_id: 'bv_3c9d0e',
      generation_id: 'gen_5d1c9a',
      posts: [
        {
          platform: 'linkedin',
          text: 'Our new studio opens this Saturday in Leeds. #coffee',
          hashtags: ['coffee'],
          picture: {
            platform: 'linkedin',
            image_url: 'https://media.skryvo.ai/images/u1/p-1200.jpg',
            width: 1200,
            height: 1200,
          },
        },
      ],
      settings: [{ field: 'tone', value: 'friendly', from: 'brand' }],
      differs_from_brand: [],
      job_id: 'job_5e4d3c2b1a09f8e7d6c5b4a3',
    },
    outputFields: [
      { key: 'status', label: 'Status' },
      { key: 'generation_id', label: 'Generation ID' },
      { key: 'posts[]platform', label: 'Post Platform' },
      { key: 'posts[]text', label: 'Post Text' },
      { key: 'posts[]error', label: 'Post Error' },
      { key: 'posts[]picture__image_url', label: 'Post Picture URL' },
    ],
  },
};
