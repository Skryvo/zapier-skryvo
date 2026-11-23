const BASE_URL = 'https://api.skryvo.ai/api/v1/agent';

const url = (path) => `${BASE_URL}${path}`;

/** Drops inputs the person left empty, so Skryvo applies the brand's own defaults. */
const given = (fields) =>
  Object.fromEntries(
    Object.entries(fields).filter(
      ([, value]) => value !== undefined && value !== null && value !== '' && !(Array.isArray(value) && !value.length),
    ),
  );

const brandField = {
  key: 'brand_id',
  label: 'Brand',
  dynamic: 'brand_list.id.name',
  helpText: "The brand to write as. Left empty, the account's default brand.",
};

module.exports = { BASE_URL, url, given, brandField };
