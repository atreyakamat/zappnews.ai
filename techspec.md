
# Technical Specification

**AI News Feed Pipeline · Stack, APIs, Schema**

## 1. Technology stack
| Layer | Tool | Why |
|---|---|---|
| Orchestration | n8n (self-hosted or cloud) | Visual workflows, no-code + code nodes |
| Database | Supabase (PostgreSQL) | Free tier, REST API |
| LLM | OpenAI GPT-4o-mini or Claude Haiku | Cheap, fast, good summaries |
| Notifications | Telegram Bot API | Free, inline buttons supported |
| Hosting | Railway or Render | Free tier, persistent |

## 2. Data sources & APIs
| Source | Method |
|---|---|
| Hacker News | Algolia HN Search API (free) |
| arXiv | RSS feed (free) |
| Reddit | Reddit API (free) |
| YouTube | YouTube Data API v3 |
| Twitter/X | Nitter RSS or Twitter API v2 |
| Threads | Meta Graph API |

## 3. Database schema
**items:** id, source, url (unique), raw_text, fetched_at, processed
**summaries:** id, item_id, summary, tag, cta, created_at
**saved:** id, summary_id, status, saved_at, notes

## 4. Cost estimate
- n8n self-hosted: $0–$5/mo
- Supabase free tier: $0
- LLM API ~500 summaries: ~$1–3/mo
- Telegram Bot: $0
- Total (without Twitter paid API): ~$1–8/mo