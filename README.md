# Skryvo for Zapier

A Zapier integration for [Skryvo](https://skryvo.ai): draft posts and emails in a brand's voice, schedule the
posts a person approved, publish finished articles to a blog, and start Zaps when posts publish or fail, articles
are ready, or new results come in.

Skryvo is a hosted AI content platform, a paid service with a 7-day free trial on Hobby and Pro
(https://skryvo.ai/pricing/). Docs: https://skryvo.ai/docs/

This repository is the integration's source, built with the Zapier Platform CLI. It is not yet listed in
Zapier's app directory.

## Connect

1. In Skryvo, open [Settings › API & agents](https://app.skryvo.ai/settings/agents) and create an API key
   (`sk_skryvo_…`, shown once).
2. In Zapier, add a Skryvo connection and paste the key. Zapier checks it and names the connection after the
   account's email.

The key acts in the workspace it was made in, with its holder's role. Revoke it in Skryvo at any time; Zapier
then asks to reconnect.

## A Zap in 60 seconds

**New blog post in your RSS feed → a LinkedIn draft → your approval → scheduled.**

1. Trigger: your feed app, New Item.
2. Skryvo › **Write a Post**: Topic = the item's title, Platforms = LinkedIn. Output:
   ```json
   {
     "status": "written",
     "generation_id": "gen_5d1c9a",
     "posts": [{ "platform": "linkedin", "text": "Our new studio opens this Saturday in Leeds. #coffee", "hashtags": ["coffee"] }]
   }
   ```
3. An approval step (an approval by email or chat that waits for a yes).
4. Skryvo › **Schedule a Post**: Text = Post Text from step 2, Channels = your LinkedIn page, Publish At = when.
   Output: `{ "id": "c1a2b3c4d5", "platform": "linkedin", "date": "2026-11-24", "time": "09:00", "status": "scheduled" }`.

Write a Post never publishes anything. Schedule a Post publishes exactly the text you give it, so map only text
the person approved. Any scheduled post can be cancelled in Skryvo before it goes out.

## Triggers, actions and searches

| Kind | Name | What it does |
|---|---|---|
| Trigger | Post Published | A scheduled post went live; carries the post with its `posted_url` |
| Trigger | Post Failed | A scheduled post did not go out; `reason` says why in plain words |
| Trigger | Article Ready | An article written through the API finished: title, words, score, link |
| Trigger | Article Failed | An article could not be finished (never charged) |
| Trigger | Results Ready | A published post's reach, engagements and clicks at 1 hour, 1 day, 7, 30, 60 or 90 days |
| Action | Write a Post | Drafts a post per platform (up to four) in the brand's voice, with a picture each if asked; one generation |
| Action | Design a Picture | One picture in the brand's kept look, sized for each platform; image credits |
| Action | Schedule a Post | Schedules approved text, with an optional picture and link, to connected channels |
| Action | Plan an Article | A free plan: headline, outline, search phrase and the questions only the person can answer |
| Action | Write an Article | Starts writing a plan (two generations); Article Ready brings the finished article |
| Action | Publish an Article | Sends a finished article to a connected blog as a draft, or schedules it |
| Action | Write an Email | Subject lines, preheader, body and call to action; nothing is sent |
| Search | Find Content | Earlier articles, posts, emails, listings or ads, by kind and title |
| Search | Find Channel | Connected channels by platform or name, with what each takes |

Every trigger is an instant webhook: turning a Zap on subscribes its own endpoint in Skryvo, turning it off
removes it. Each delivery is checked against its `Skryvo-Signature` header with the endpoint's secret, and one
that does not match, or is over five minutes old, starts nothing. Samples come from your account's recent posts,
articles and results.

Zapier allows a step 30 seconds, and writing posts, designing a picture and planning an article can take Skryvo
about a minute. Those three steps hand Skryvo the address Zapier gives a step that finishes later: the task shows as
waiting, and when Skryvo posts the finished job there, signed with that job's own secret, the step completes with
Skryvo's normal answer. A callback that isn't signed for that job is not used. A job that fails fails the step with
Skryvo's reason and says nothing was charged.

## Errors

A step that Skryvo refuses fails with Skryvo's own sentence, for example "That time has passed. Pick a time in
the future." A revoked key asks you to reconnect. Rate limits (60 requests a minute, 1000 an hour per key) are
retried by Zapier.

## Develop

```bash
npm install
npm test                                  # offline tests with recorded answers from Skryvo's API description
npx zapier-platform validate              # schema and Zapier's integration checks
```

`test/openapi.json` is Skryvo's published API description (`https://api.skryvo.ai/openapi.json`); a test fails
when the app calls a route it lacks. Replace the file to follow a new version.

To deploy (needs a Zapier account): `npx zapier-platform login`, `npx zapier-platform register "Skryvo"` once,
then `npx zapier-platform push`.

Issues: https://github.com/Skryvo/zapier-skryvo/issues · support@skryvo.ai

## License

MIT © Flutter Studio LLC
