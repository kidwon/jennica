#!/usr/bin/env python3
"""Generate a structured pharma report from cached RSS entries."""
from __future__ import annotations

import argparse
import json
import sys
from collections import Counter, defaultdict
from datetime import datetime, timezone, timedelta
from pathlib import Path
from typing import Dict, List

TARGET_TZ = timezone(timedelta(hours=8))
CATEGORY_RULES = [
    ("regulatory", "Regulatory Decisions / 监管审批", ["fda", "ema", "approval", "approve", "授权", "批准", "cder", "审评"]),
    ("clinical", "Clinical Trials / 临床试验", ["phase", "trial", "临床", "终点", "randomized", "study"]),
    ("launch", "Drug Launches / 上市与商业化", ["launch", "commercial", "上市", "营销", "pricing", "市场投放"]),
    ("partnership", "Partnerships & M&A / 合作并购", ["partnership", "collaboration", "并购", "acquire", "licensing", "交易"]),
    ("financing", "Financing / 投融资", ["funding", "融资", "raise", "series", "investment"]),
    ("manufacturing", "Manufacturing & Supply / 产能供应", ["manufacturing", "产能", "生产", "supply", "factory"]),
    ("market", "Market Outlook / 市场洞察", ["market", "forecast", "outlook", "需求", "趋势"]),
]

KEYWORD_BANK = [
    {"name": "辉瑞 Pfizer", "aliases": ["pfizer", "辉瑞"]},
    {"name": "莫德纳 Moderna", "aliases": ["moderna"]},
    {"name": "默沙东 Merck", "aliases": ["merck", "msd", "keytruda"]},
    {"name": "阿斯利康 AstraZeneca", "aliases": ["astrazeneca"]},
    {"name": "礼来 Eli Lilly", "aliases": ["eli lilly", "lilly"]},
    {"name": "武田 Takeda", "aliases": ["takeda"]},
    {"name": "RSV疫苗", "aliases": ["rsv"]},
    {"name": "GLP-1", "aliases": ["glp-1", "glp1"]},
]

def load_entries(date: str) -> Dict[str, object]:
    repo_root = Path(__file__).resolve().parents[3]
    path = repo_root / "storage" / "pharma-news" / f"{date}.json"
    if not path.exists():
        print(f"[ERROR] Cache {path} not found", file=sys.stderr)
        sys.exit(1)
    with path.open("r", encoding="utf-8") as fp:
        return json.load(fp)


def normalize_text(value: str) -> str:
    return value.lower() if value else ""


def detect_category(text: str) -> str:
    text_lower = normalize_text(text)
    for cat_id, _label, keywords in CATEGORY_RULES:
        if any(keyword in text_lower for keyword in keywords):
            return cat_id
    return "market"


def describe_category(cat_id: str) -> str:
    mapping = {cid: label for cid, label, _ in CATEGORY_RULES}
    return mapping.get(cat_id, "Market Outlook / 市场洞察")


def summarize_entry(entry: Dict[str, str]) -> Dict[str, str]:
    text = f"{entry.get('title', '')} {entry.get('summary', '')}"
    cat_id = detect_category(text)
    insight = (entry.get("summary") or entry.get("title") or "").strip()
    if len(insight) > 160:
        insight = insight[:157] + "..."
    return {
        "category": cat_id,
        "title": entry.get("title", "(未命名)"),
        "insight": insight,
        "source": entry.get("source", "未知来源"),
        "url": entry.get("url"),
        "published_local": entry.get("published_local"),
    }


def extract_keywords(entries: List[Dict[str, str]]) -> List[Dict[str, str]]:
    counts = Counter()
    for entry in entries:
        text = normalize_text(entry.get("title", "") + " " + entry.get("summary", ""))
        for keyword in KEYWORD_BANK:
            if any(alias in text for alias in keyword["aliases"]):
                counts[keyword["name"]] += 1
    result = []
    for keyword in KEYWORD_BANK:
        name = keyword["name"]
        count = counts.get(name, 0)
        if count == 0:
            continue
        if count >= 3:
            heat = "高"
        elif count == 2:
            heat = "中"
        else:
            heat = "低"
        result.append({
            "name": name,
            "heat": heat,
            "count": count,
        })
    return result


def build_takeaways(entries: List[Dict[str, str]], limit: int = 3) -> List[str]:
    takeaways = []
    for entry in entries[:limit]:
        source = entry.get("source", "来源")
        title = entry.get("title", "")
        takeaways.append(f"{source}: {title}")
    return takeaways


def generate_report(date: str, data: Dict[str, object]) -> Dict[str, object]:
    items = data.get("items", [])
    summarized = [summarize_entry(item) for item in items]

    categories: Dict[str, Dict[str, object]] = {}
    stats = Counter()
    for entry in summarized:
        cat_id = entry["category"]
        stats[cat_id] += 1
        categories.setdefault(cat_id, {
            "id": cat_id,
            "name": describe_category(cat_id),
            "items": [],
        })["items"].append({k: v for k, v in entry.items() if k != "category"})

    # Sort categories and items by recency
    for cat in categories.values():
        cat["items"].sort(key=lambda item: item.get("published_local", ""), reverse=True)
    sorted_categories = sorted(categories.values(), key=lambda cat: stats[cat["id"]], reverse=True)

    takeaways = build_takeaways(items)
    keywords = extract_keywords(items)

    now = datetime.now(timezone.utc).astimezone(TARGET_TZ)
    return {
        "date": date,
        "generated_at": now.isoformat(),
        "source_count": data.get("source_count"),
        "item_count": data.get("item_count"),
        "takeaways": takeaways,
        "categories": sorted_categories,
        "keywords": keywords,
        "sources": sorted({item.get("source") for item in items if item.get("source")}),
        "stats": {describe_category(key): count for key, count in stats.items()},
    }


def save_report(report: Dict[str, object], public: bool = False):
    repo_root = Path(__file__).resolve().parents[3]
    storage_dir = repo_root / "storage" / "pharma-news"
    storage_dir.mkdir(parents=True, exist_ok=True)
    report_path = storage_dir / f"{report['date']}.report.json"
    with report_path.open("w", encoding="utf-8") as fp:
        json.dump(report, fp, ensure_ascii=False, indent=2)
    print(f"Saved report to {report_path}")

    if public:
        public_dir = repo_root / "public" / "pharma-news"
        public_dir.mkdir(parents=True, exist_ok=True)
        public_path = public_dir / f"{report['date']}.report.json"
        with public_path.open("w", encoding="utf-8") as fp:
            json.dump(report, fp, ensure_ascii=False, indent=2)
        print(f"Copied report to {public_path}")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Generate structured pharma report")
    parser.add_argument("--date", required=True, help="Date in YYYY-MM-DD (must exist in storage)")
    parser.add_argument("--public", action="store_true", help="Copy report to public/pharma-news for frontend use")
    return parser.parse_args()


def main():
    args = parse_args()
    data = load_entries(args.date)
    report = generate_report(args.date, data)
    save_report(report, public=args.public)


if __name__ == "__main__":
    main()
