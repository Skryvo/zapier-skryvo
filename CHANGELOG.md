# Changelog

## 1.0.0

- Sign in with a Skryvo API key, labelled with the account's email.
- Triggers: Post Published, Post Failed, Article Ready, Article Failed and Results Ready, each a signed webhook
  that subscribes when a Zap is turned on and unsubscribes when it is turned off, with recent items as samples.
- Actions: Write a Post (with pictures if asked), Design a Picture, Schedule a Post, Plan an Article, Write an
  Article, Publish an Article, Write an Email. The three long ones wait for Skryvo's signed answer at the step's
  callback address; a failed job fails the step and says nothing was charged.
- Searches: Find Content, Find Channel.
