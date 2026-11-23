const { given, brandField } = require('../lib/api');
const { start, resume } = require('../lib/later');

const design = start('/pictures');

module.exports = {
  key: 'design_picture',
  noun: 'Picture',
  display: {
    label: 'Design a Picture',
    description: "Designs one picture for a post in the brand's kept look, sized for each platform, using image credits.",
  },
  operation: {
    inputFields: [
      { key: 'text', label: 'Text', type: 'text', required: true, helpText: "The post's text; the picture carries its opening line." },
      {
        key: 'platforms',
        label: 'Platforms',
        required: true,
        list: true,
        dynamic: 'platform_list.id.name',
        helpText: 'A copy is sized for each.',
      },
      brandField,
      { key: 'headline', label: 'Headline', helpText: 'Up to nine words on the picture, in place of the opening line.' },
      { key: 'direction', label: 'Direction', helpText: "closer, bolder, calmer, or the person's own words." },
    ],
    perform: async (z, bundle) => {
      const d = bundle.inputData;
      return design(
        z,
        bundle,
        given({ text: d.text, platforms: d.platforms, brand_id: d.brand_id, headline: d.headline, direction: d.direction }),
      );
    },
    performResume: resume,
    sample: {
      brand_id: 'bv_3c9d0e',
      headline: 'Our new studio opens Saturday',
      pictures: [
        { platform: 'linkedin', image_url: 'https://media.skryvo.ai/images/u1/p-1200.jpg', width: 1200, height: 1200 },
      ],
      credits_used: 4,
      credits_left: 176,
      job_id: 'job_5e4d3c2b1a09f8e7d6c5b4a3',
    },
    outputFields: [
      { key: 'headline', label: 'Headline' },
      { key: 'pictures[]platform', label: 'Picture Platform' },
      { key: 'pictures[]image_url', label: 'Picture URL' },
      { key: 'pictures[]width', label: 'Picture Width', type: 'integer' },
      { key: 'pictures[]height', label: 'Picture Height', type: 'integer' },
      { key: 'credits_used', label: 'Credits Used', type: 'integer' },
      { key: 'credits_left', label: 'Credits Left', type: 'integer' },
    ],
  },
};
