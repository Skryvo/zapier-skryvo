const { url, given } = require('../lib/api');

module.exports = {
  key: 'publish_article',
  noun: 'Article',
  display: {
    label: 'Publish an Article',
    description: 'Schedules a finished article to a connected blog, or sends it there now as a draft to review.',
  },
  operation: {
    inputFields: [
      { key: 'article_id', label: 'Article', required: true, dynamic: 'article_list.id.title' },
      { key: 'channel_id', label: 'Blog', required: true, dynamic: 'blog_list.id.label' },
      {
        key: 'as_draft',
        label: 'Send as Draft',
        type: 'boolean',
        default: 'true',
        helpText: 'Yes sends it to the blog now as a draft, to review and publish there.',
      },
      {
        key: 'at',
        label: 'Publish At',
        type: 'datetime',
        helpText: 'When Send as Draft is no. Left empty, in about five minutes.',
      },
      { key: 'original_url', label: 'Original URL', helpText: "The article's first home, credited by every copy." },
    ],
    perform: async (z, bundle) => {
      const d = bundle.inputData;
      const answer = await z.request({
        url: url(`/articles/${encodeURIComponent(d.article_id)}/publish`),
        method: 'POST',
        body: given({
          channel_id: d.channel_id,
          as_draft: d.as_draft === true || d.as_draft === 'true',
          at: d.at,
          original_url: d.original_url,
        }),
      });
      return answer.data.post;
    },
    sample: {
      status: 'draft',
      channel_id: 'conn_wp41',
      edit_url: 'https://journal.example.com/wp-admin/post.php?post=812&action=edit',
      preview_url: 'https://journal.example.com/?p=812&preview=true',
      pictures_uploaded: 2,
      warnings: [],
    },
    outputFields: [
      { key: 'status', label: 'Status' },
      { key: 'edit_url', label: 'Edit URL' },
      { key: 'id', label: 'Scheduled Post ID' },
      { key: 'date', label: 'Date' },
      { key: 'time', label: 'Time' },
    ],
  },
};
