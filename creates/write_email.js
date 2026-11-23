const { url, given, brandField } = require('../lib/api');

module.exports = {
  key: 'write_email',
  noun: 'Email',
  display: {
    label: 'Write an Email',
    description: "Writes subject lines, a preheader, the body and a call to action in the brand's voice. Nothing is sent.",
  },
  operation: {
    inputFields: [
      { key: 'about', label: 'About', type: 'text', required: true, helpText: 'What the email is about.' },
      {
        key: 'email_type',
        label: 'Email Type',
        required: true,
        choices: {
          announcement: 'Announcement',
          follow_up: 'Follow-up',
          newsletter: 'Newsletter',
          promotional: 'Promotional',
          re_engagement: 'Re-engagement',
          transactional: 'Transactional',
          welcome: 'Welcome',
        },
      },
      brandField,
      { key: 'tone', label: 'Tone' },
      { key: 'language', label: 'Language', helpText: 'A language code such as en or de.' },
      { key: 'audience', label: 'Audience' },
      { key: 'call_to_action', label: 'Call to Action' },
      { key: 'length', label: 'Length', type: 'integer', helpText: 'Body words, 100 to 1000.' },
    ],
    perform: async (z, bundle) => {
      const d = bundle.inputData;
      const answer = await z.request({
        url: url('/emails'),
        method: 'POST',
        body: given({
          about: d.about,
          email_type: d.email_type,
          brand_id: d.brand_id,
          tone: d.tone,
          language: d.language,
          audience: d.audience,
          call_to_action: d.call_to_action,
          length: d.length ? Number(d.length) : undefined,
        }),
      });
      return answer.data;
    },
    sample: {
      status: 'written',
      brand_id: 'bv_3c9d0e',
      generation_id: 'gen_e41b07',
      subject_lines: ['Spring is on the menu', 'Three new plates for spring'],
      preheader: 'Come taste what is new this week.',
      body: 'Hi,\n\nOur spring menu starts on Monday…',
      call_to_action: 'Book a table',
      settings: [{ field: 'campaign_type', value: 'promotional', from: 'you' }],
    },
    outputFields: [
      { key: 'subject_lines', label: 'Subject Lines', list: true },
      { key: 'preheader', label: 'Preheader' },
      { key: 'body', label: 'Body' },
      { key: 'call_to_action', label: 'Call to Action' },
      { key: 'generation_id', label: 'Generation ID' },
    ],
  },
};
