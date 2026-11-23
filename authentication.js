const { url } = require('./lib/api');

module.exports = {
  type: 'custom',
  fields: [
    {
      key: 'api_key',
      label: 'API Key',
      type: 'password',
      required: true,
      helpText:
        'Create a key in Skryvo under [Settings › API & agents](https://app.skryvo.ai/settings/agents). It starts with `sk_skryvo_` and is shown once.',
    },
  ],
  test: { url: url('/me') },
  connectionLabel: '{{email}}',
};
