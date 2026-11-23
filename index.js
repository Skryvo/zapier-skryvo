const authentication = require('./authentication');
const { addKey, explain } = require('./lib/middleware');
const lists = require('./triggers/lists');
const { triggers } = require('./triggers/hooks');
const writePost = require('./creates/write_post');
const schedulePost = require('./creates/schedule_post');
const publishArticle = require('./creates/publish_article');
const writeEmail = require('./creates/write_email');
const designPicture = require('./creates/design_picture');
const planArticle = require('./creates/plan_article');
const writeArticle = require('./creates/write_article');
const findContent = require('./searches/find_content');
const findChannel = require('./searches/find_channel');

const byKey = (items) => Object.fromEntries(items.map((item) => [item.key, item]));

module.exports = {
  version: require('./package.json').version,
  platformVersion: require('zapier-platform-core').version,
  flags: { cleanInputData: false },
  authentication,
  beforeRequest: [addKey],
  afterResponse: [explain],
  triggers: byKey([...triggers, ...lists]),
  creates: byKey([writePost, designPicture, schedulePost, planArticle, writeArticle, publishArticle, writeEmail]),
  searches: byKey([findContent, findChannel]),
};
