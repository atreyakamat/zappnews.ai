
# Project Roadmap

**AI News Feed Pipeline · Phase-by-phase plan**

## Phase 0 — Foundation (Week 1)
- Set up n8n locally (Docker) or on Railway
- Create Supabase project, run schema migrations
- Create Telegram bot via @BotFather
- Build first workflow: fetch Hacker News → store in DB
- Build second workflow: query DB → send Telegram
- Verify end-to-end pipeline

## Phase 1 — More sources + LLM (Week 2)
- Add Reddit, arXiv, YouTube sources
- Integrate LLM summarisation node
- Add URL deduplication logic
- Test full pipeline: 3+ sources → summarise → Telegram

## Phase 2 — Save & remind (Week 3)
- Add inline [Save] buttons to Telegram messages
- Build webhook to handle save callbacks
- Build weekend digest workflow (Saturday 9am)

## Phase 3 — Twitter/Threads (Week 4)
- Evaluate Twitter API options
- Set up Meta developer account for Threads
- Add social sources with rate limit handling

## Phase 4 — Web dashboard (Week 5–6)
- Build simple HTML/Next.js saved items library
- Filter by tag and status
- Deploy to Vercel

## Phase 5 — Multi-user (Month 2+)
- Add user accounts (Supabase Auth)
- Allow topic customisation
- Add email digest option