# Product Requirements Document

**AI News Feed Pipeline · v1.0 · Personal MVP**

## 1. Overview
A personal automated pipeline that continuously aggregates AI-related content from Twitter/X, Threads, Reddit, RSS feeds, and other platforms. It summarises each item using an LLM, stores them in a database, pushes daily digest notifications to Telegram or WhatsApp, and surfaces a weekend "try it out" reminder so the user can experiment with new tools and ideas.

## 2. Problem statement
AI news moves fast. Valuable tool releases, research papers, and project ideas appear across many platforms daily. Without a curated pipeline, staying informed means manually checking 5–10 sources, leads to missed opportunities, and provides no mechanism for acting on interesting finds.

## 3. Goals
- Aggregate AI news from 4+ platforms with zero manual effort
- Summarise each item into a 2–3 sentence digest with a CTA hint
- Store saved items with links, tags, and "try it out" status
- Deliver a daily push notification (Telegram or WhatsApp)
- Send a weekend digest of bookmarked items for experimentation
- Extensible for multiple users in future

## 4. Non-goals (v1)
- No mobile app — Telegram bot is the notification layer
- No social sharing or public feed
- No real-time streaming — scheduled batch fetch is sufficient
- No payments or subscription management

## 5. User stories
| ID | As a user I want to… | Priority |
|---|---|---|
| US-01 | Receive a daily Telegram message with top 5 AI news items | Must |
| US-02 | Tap a link in the message to read the full article | Must |
| US-03 | Save an item to my personal library with one tap | Must |
| US-04 | Receive a weekend digest of my saved items | Must |
| US-05 | Tag items (tool / paper / project idea / tutorial) | Should |
| US-06 | Mark an item as "tried" or "done" | Should |
| US-07 | View my saved library on a simple web page | Nice |

## 6. Success metrics
- Pipeline runs reliably daily with <5% missed fetches per week
- Each summary is ≤3 sentences and includes a CTA
- Weekend digest sent every Saturday by 9am
- Saved item library accessible and searchable