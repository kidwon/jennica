---
name: pharma-daily-intel
description: Fetches curated pharma & biotech RSS feeds, normalizes entries by date, and equips Claude with prompts/templates to produce a daily intelligence brief (markdown, HTML, share cards). Use when users request life-science market coverage, trial readouts, regulatory approvals, or financing news.
---

# Pharma Daily Intelligence

A modular workflow inspired by `ai-daily-news` that serves life-science operators. It ships with RSS fetch utilities, stored payloads, markdown format guidelines, and optional assets so an agent can deliver research-grade briefings.

## Quick Start

```bash
# Default (today UTC+8)
python skills/pharma-daily/scripts/fetch_pharma_news.py

# Specific date
python skills/pharma-daily/scripts/fetch_pharma_news.py --date 2026-02-10

# Inspect available cache window
python skills/pharma-daily/scripts/fetch_pharma_news.py --date-range
```

1. Run the fetch script to populate `storage/pharma-news/{date}.json`.
2. Feed the JSON bundle plus prompts in `references/` to Claude to summarize, categorize, and produce markdown.
3. If required, render HTML (`references/templates/pharma-briefing.html`) or share cards (`pharma-card.json`).

## Source Coverage

| ID | Name | Focus |
|----|------|-------|
| `fiercepharma` | FiercePharma | Launches, commercial strategy |
| `endpoints` | Endpoints News | Trials, biotech financing |
| `pharmatimes` | PharmaTimes | Policy, market access |
| `fda-cder` | FDA CDER Releases | Regulatory decisions |
| `clinicaltrials` | ClinicalTrials.gov results | Study completions |

Each entry in the stored JSON contains `source`, `title`, `summary`, `published_at`, and `date` so downstream prompts can group by category or highlight keywords.

## Output Expectations

- Title: `{date} 制药情报日报`
- Sections: `今日速览`, `分类解读`, `关键词雷达`, `数据附录`
- Categories: `Drug Launches`, `Clinical Trials`, `Regulatory Decisions`, `Partnerships & M&A`, `Financing`, `Manufacturing & Supply`, `Market Outlook`
- Always cite the originating source and include direct URLs.

## Optional Assets

| Asset | Template | Notes |
|-------|----------|-------|
| HTML Briefing | `references/templates/pharma-briefing.html` | Apple-style typography, category chips |
| Share Card | `references/templates/pharma-card.json` | For posting to WeChat/LinkedIn |

## QA Checklist

- [ ] Target date uses `YYYY-MM-DD` (UTC+8)
- [ ] ≥3 distinct sources referenced (unless unavailable)
- [ ] Empty categories omitted from markdown
- [ ] Cache refreshed at most once every 30 minutes to respect publisher rate limits
