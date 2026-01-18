# Pharma Daily Output Format

```
# {date} 制药情报日报

## 今日速览
- {Key takeaway 1}
- {Key takeaway 2}
- ... (3-5 bullets)

## 分类解读
### {Category Name}
- **{Article Title}** — {Insight sentence} [来源: {Source}]
- ...

## 关键词雷达
| 关键词 | 关联公司/药物 | 热度 |
|--------|---------------|------|
| {keyword} | {company/drug} | {低/中/高} |

## 数据附录
- 数据日期: {date}
- 数据源: FiercePharma · Endpoints · PharmaTimes · FDA · ClinicalTrials.gov
- 生成时间: {ISO8601 timestamp}
```

Notes:
- Localize category headings (e.g., `Regulatory Decisions / 监管审批`).
- Heat level is derived from occurrence counts across the day (≥3 ⇒ 高, 2 ⇒ 中, 1 ⇒ 低).
- Include source URLs when referencing items (Markdown link on the title is acceptable).
