# Design Document

**AI News Feed Pipeline · UI/UX & System Design**

## 1. System design principles
- Async-first: all fetching happens on schedules, never blocking
- Deduplication: URL hashing prevents the same article appearing twice
- Graceful degradation: if one source fails, others still deliver
- Human-in-the-loop saves: user explicitly saves items — no auto-curation

## 2. Information architecture
- `items` — raw fetched posts with source, URL, raw text, timestamp
- `summaries` — LLM-generated summary, tags, CTA, linked to item
- `saved` — user's saved items with status (unread / tried / done)

## 3. Telegram bot UX flow
- Header: "🤖 AI News — {date}"
- 5 items, each with: title, 2-sentence summary, CTA hint, original link
- Inline buttons: [Save] [Skip] per item
- Weekend: "📦 Your saved items for this weekend:" + list with [Try it] buttons

## 4. n8n workflow design
| Workflow | Trigger | Steps |
|---|---|---|
| Fetch & summarise | Cron: every 6h | Fetch sources → deduplicate → LLM summarise → store in DB |
| Daily digest | Cron: 8am daily | Query top 5 from DB → format → send Telegram |
| Weekend digest | Cron: 9am Saturday | Query saved items → format → send Telegram |
| Save handler | Telegram button callback | Receive save action → update DB record |

## 5. LLM prompt design
System prompt: "You are a concise AI news curator. Given a post or article, output: (1) a 2-sentence summary for a developer audience, (2) a category tag from [tool, paper, project, tutorial, opinion], (3) a one-line CTA like 'Try it: [what to do]'. Be specific, not hype-y."