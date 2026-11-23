const { given, brandField } = require('../lib/api');
const { start, resume } = require('../lib/later');

const plan = start('/articles/plan');

module.exports = {
  key: 'plan_article',
  noun: 'Article Plan',
  display: {
    label: 'Plan an Article',
    description:
      'Plans an article for free: headline, outline, search phrase and the questions only the person can answer. Write an Article then writes it.',
  },
  operation: {
    inputFields: [
      { key: 'topic', label: 'Topic', required: true, helpText: 'What the article is about, 3 to 200 characters.' },
      brandField,
      { key: 'only_you', label: 'Only You Know', type: 'text', helpText: 'Facts only the person knows, used in their words.' },
      { key: 'sources', label: 'Sources', list: true, helpText: 'Up to three public pages to read.' },
      { key: 'keywords', label: 'Keywords', list: true, helpText: 'Search phrases, up to ten.' },
      { key: 'length', label: 'Length', type: 'integer', helpText: 'Words, 100 to 4000.' },
      { key: 'tone', label: 'Tone' },
      { key: 'style', label: 'Style', helpText: 'For example how-to, listicle, comparison, case study or explainer.' },
      { key: 'language', label: 'Language', helpText: 'A language code such as en or de.' },
      { key: 'audience', label: 'Audience' },
      { key: 'notes', label: 'Notes', type: 'text' },
    ],
    perform: async (z, bundle) => {
      const d = bundle.inputData;
      return plan(
        z,
        bundle,
        given({
          topic: d.topic,
          brand_id: d.brand_id,
          only_you: d.only_you,
          sources: d.sources,
          keywords: d.keywords,
          length: d.length ? Number(d.length) : undefined,
          tone: d.tone,
          style: d.style,
          language: d.language,
          audience: d.audience,
          notes: d.notes,
        }),
      );
    },
    performResume: resume,
    sample: {
      status: 'confirm',
      plan_id: 'pl_91ab3e',
      brand_id: 'bv_3c9d0e',
      headline: 'How to choose a coffee grinder for home',
      other_headlines: ['Burr or blade: picking a home grinder'],
      search_phrase: 'best coffee grinder for home',
      outline: [{ heading: 'Burr or blade', covers: 'Why burrs grind evenly' }],
      questions: ['Which grinder do you use in the shop?'],
      job_id: 'job_5e4d3c2b1a09f8e7d6c5b4a3',
    },
    outputFields: [
      { key: 'plan_id', label: 'Plan ID' },
      { key: 'headline', label: 'Headline' },
      { key: 'search_phrase', label: 'Search Phrase' },
      { key: 'questions', label: 'Questions', list: true },
      { key: 'outline[]heading', label: 'Outline Heading' },
    ],
  },
};
