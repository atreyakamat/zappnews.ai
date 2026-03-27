# Implementation Checklist

**AI News Feed Pipeline · Task-by-task execution list**

## Setup tasks
- [ ] Install Docker, run n8n: `docker run -it --rm --name n8n -p 5678:5678 n8nio/n8n`
- [ ] Create Supabase project, run schema SQL
- [ ] Create Telegram bot via @BotFather, get token + chat ID
- [ ] Add all credentials to n8n

## Source integration tasks
- [ ] HN Algolia API
- [ ] arXiv RSS feed
- [ ] Reddit OAuth2
- [ ] YouTube Data API
- [ ] Twitter: Nitter RSS or API v2
- [ ] Threads: Meta Graph API

## Pipeline tasks
- [ ] Build URL dedup check
- [ ] Build LLM summarise node
- [ ] Build store node (Supabase insert)
- [ ] Set fetch cron every 6 hours

## Delivery tasks
- [ ] Build daily digest query (top 5, last 24h)
- [ ] Format Telegram message with inline [Save] button
- [ ] Build webhook for save callbacks
- [ ] Build weekend digest (Saturday 9am cron)
- [ ] Test full end-to-end flow

## Web dashboard tasks
- [ ] Build saved items page (Vercel + Supabase)
- [ ] Filter by tag, status
- [ ] "Mark as tried" button

## Hardening tasks
- [ ] Error handling on all HTTP nodes
- [ ] Telegram alert on workflow failure
- [ ] Monitor LLM token costs