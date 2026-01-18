---
name: pharma-daily-intel
description: Curates daily pharmaceutical & biotech intelligence from leading RSS sources, enriches with domain-aware summaries, categorization, and optional briefing assets. Use for drug launch updates, trial readouts, regulatory decisions, financing deals, or when user requests pharma market coverage.
---

# Pharma Daily Intelligence

A Claude-powered workflow modeled after `ai-daily-news` that focuses on life sciences developments. It aggregates selected RSS feeds (FiercePharma, Endpoints News, PharmaTimes, FDA updates, ClinicalTrials.gov highlights), normalizes items per day, generates structured markdown briefings, and can optionally export themed HTML pages or shareable card images tailored for pharma comms.

## Quick Start

```bash
昨天制药资讯
2026-02-10的药企新闻
昨天的监管审批动态
昨天制药资讯，生成网页
今天的制药资讯，生成图卡
```

## Supported Query Types

| Type | Examples | Description |
|------|----------|-------------|
| **Relative Date** | "昨天制药资讯" "前天的药企动态" | Yesterday / day-before summary |
| **Absolute Date** | "2026-02-10的药企新闻" | Explicit YYYY-MM-DD |
| **Category Filter** | "临床试验动态" "监管审批" | Restrict to matching category |
| **Source Filter** | "FiercePharma的新闻" | Optional `source:` override |
| **Webpage Export** | "生成网页" | Produces Apple-style HTML briefing |
| **Share Card** | "生成图卡" | Makes shareable poster summarizing key stats |

---

## Workflow Checklist

```
Progress:
- [ ] Step 1: Parse date & filters from user intent
- [ ] Step 2: Build source list & fetch RSS
- [ ] Step 3: Validate content availability
- [ ] Step 4: Enrich articles with Claude (summary, category, keywords)
- [ ] Step 5: Generate structured markdown output
- [ ] Step 6: Optional assets (HTML, shareable image)
```

---

## Step 1: Parse Date & Filters

- Support `昨天/前天/今天` → convert to UTC+8 date string (`YYYY-MM-DD`).
- Parse explicit dates using regex `\d{4}-\d{2}-\d{2}`.
- Detect category keywords ("临床", "审批", "合作", "投融资", "供应链") and set `category_filter`.
- Detect explicit sources ("FiercePharma", "Endpoints", "FDA") via keyword map.

---

## Step 2: Fetch Sources

Use `scripts/fetch_pharma_news.py` to call bundled fetchers:

| Source | Feed | Notes |
|--------|------|-------|
| FiercePharma | https://www.fiercepharma.com/rss | Commercial + launches |
| Endpoints News | https://endpts.com/feed/ | Trials & funding |
| PharmaTimes | https://www.pharmatimes.com/rss | Policy & market |
| FDA CDER News | https://www.fda.gov/about-fda/contact-fda/stay-informed/rss-feeds/rss-feeds-press-releases | Regulatory |
| ClinicalTrials.gov new results | https://clinicaltrials.gov/ct2/results/rss.xml?recrs=&cond=&term=&type=Results | Trial completions |

Script flags:

```bash
python plugins/pharma-daily/skills/pharma-daily/scripts/fetch_pharma_news.py --date 2026-02-10
python plugins/pharma-daily/skills/pharma-daily/scripts/fetch_pharma_news.py --date-range
```

Implementation tips:
- Cache raw JSON per date under `storage/pharma-news/{date}.json` to avoid rate limits.
- Attach `source` metadata for downstream filtering.

---

## Step 3: Validate Content

If no entries for target date:

```markdown
抱歉，2026-02-10 暂无制药资讯

可用日期范围: 2026-02-06 ~ 2026-02-09

建议:
- 查看 [2026-02-09](command:查看2026-02-09的制药资讯)
- 订阅邮箱提醒 (command:订阅制药日报)
```

Always:
1. Explain gap
2. Surface available alternatives (max 3)
3. Offer CTA commands (view other date, subscribe, change category)

---

## Step 4: Enrich with Claude

For each article, send prompt:

```
You are an equity analyst focused on pharma & biotech.
Summarize the following article with:
1. One-sentence headline (~22 chars CN)
2. 2 bullet key insights (impact on patients, market, pipeline)
3. Category from: Drug Launches, Clinical Trials, Regulatory Decisions, Partnerships & M&A, Financing, Manufacturing & Supply, Market Outlook
4. 3 keywords (Company/Drug/Mechanism)
Return JSON.

Article:
{title}
{body}
```

Store enriched payload:
```json
{
  "title": "Pfizer's RSV shot gains EU nod",
  "summary": ["欧盟人用药品委员会推荐批准...", "辉瑞计划2026年中在德建厂以扩充供应"],
  "category": "Regulatory Decisions",
  "keywords": ["辉瑞", "RSV疫苗", "EMA"]
}
```

---

## Step 5: Generate Markdown

Follow `references/output-format.md` (create variant for pharma). Sections:

1. `# {date} 制药情报日报`
2. `## 今日速览` – 3-5 aggregated takeaways (pipeline, regulatory, financing).
3. `## 分类解读`
   - For each category with content, list bullet items: `**{title}** — {insight}` plus badges `[Source: FiercePharma]`.
4. `## 关键词雷达`
   - Table with `关键词 | 关联公司 | 热度(低/中/高)` (heat from article count).
5. `## 数据附录`
   - Source URLs and fetch timestamps.

---

## Step 6: Optional Assets

### HTML Briefing
- Template path: `references/templates/pharma-briefing.html`
- Use Apple/medical color palette (indigo/teal) and include category color chips.

### Shareable Card
- Template path: `references/templates/pharma-card.json`
- Include: date, top 2 insights, 3 keywords, brand logo.
- Export via `scripts/render_card.py --theme pharma`.

---

## QA Checklist

- [ ] Dates normalized to UTC+8, `YYYY-MM-DD`
- [ ] Categories localized (中文标签) and limited to defined set
- [ ] At least 3 unique sources referenced per report (unless data unavailable)
- [ ] Markdown validated (no empty sections)
- [ ] Optional assets attached only when requested

---

## Future Enhancements

- Integrate IQVIA / Evaluate Vantage APIs for revenue forecasts
- Add adverse-event monitoring feed (FAERS weekly)
- Support voice summary generation via ElevenLabs for exec briefings
- Hook to CRM for send-to-email workflows
