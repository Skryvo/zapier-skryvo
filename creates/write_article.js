const { url, given } = require('../lib/api');

module.exports = {
  key: 'write_article',
  noun: 'Article',
  display: {
    label: 'Write an Article',
    description:
      'Starts writing a planned article (two generations). It takes about four minutes; use the Article Ready trigger for the result.',
  },
  operation: {
    inputFields: [
      { key: 'plan', label: 'Plan', required: true, helpText: 'The Plan ID from a Plan an Article step.' },
      {
        key: 'answers',
        label: 'Answers',
        children: [
          { key: 'question', label: 'Question', helpText: "One of the plan's questions." },
          { key: 'answer', label: 'Answer', type: 'text', helpText: "The person's answer, used in their words." },
        ],
      },
      { key: 'headline', label: 'Headline', helpText: "One of the plan's headlines, or the person's own." },
      { key: 'notes', label: 'Notes', type: 'text' },
      { key: 'pictures', label: 'Cover Picture', type: 'boolean', helpText: 'No writes it without pictures.' },
    ],
    perform: async (z, bundle) => {
      const d = bundle.inputData;
      const answers = (d.answers || []).filter((a) => a && a.question && a.answer);
      const answer = await z.request({
        url: url('/articles'),
        method: 'POST',
        body: given({
          plan_id: d.plan,
          answers,
          headline: d.headline,
          notes: d.notes,
          pictures: d.pictures === undefined || d.pictures === '' ? undefined : d.pictures === true || d.pictures === 'true',
        }),
      });
      return answer.data;
    },
    sample: {
      article_id: 'pl_91ab3e',
      status: 'writing',
      minutes: 4,
      settings: [{ field: 'word_count', value: 1500 }],
    },
    outputFields: [
      { key: 'article_id', label: 'Article ID' },
      { key: 'status', label: 'Status' },
      { key: 'minutes', label: 'Minutes', type: 'integer' },
    ],
  },
};
