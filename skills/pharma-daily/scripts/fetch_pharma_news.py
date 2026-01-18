#!/usr/bin/env python3
"""Fetch pharma & biotech RSS feeds and store grouped JSON payloads."""
from __future__ import annotations

import argparse
import json
import sys
from datetime import datetime, timedelta, timezone
from email.utils import parsedate_to_datetime
from pathlib import Path
from typing import Dict, List, Optional
from urllib import error, request
from xml.etree import ElementTree as ET

TARGET_TZ = timezone(timedelta(hours=8))
SOURCES = [
    {
        "id": "fiercepharma",
        "name": "FiercePharma",
        "url": "https://www.fiercepharma.com/rss",
    },
    {
        "id": "endpoints",
        "name": "Endpoints News",
        "url": "https://endpts.com/feed/",
    },
    {
        "id": "pharmatimes",
        "name": "PharmaTimes",
        "url": "https://www.pharmatimes.com/rss",
    },
    {
        "id": "fda-cder",
        "name": "FDA CDER",
        "url": "https://www.fda.gov/about-fda/contact-fda/stay-informed/rss-feeds/rss-feeds-press-releases",
    },
    {
        "id": "clinicaltrials",
        "name": "ClinicalTrials.gov",
        "url": "https://clinicaltrials.gov/ct2/results/rss.xml?recrs=&cond=&term=&type=Results",
    },
]


def node_text(node: ET.Element, tag: str) -> str:
    """Return the stripped text for the first matching tag (any namespace)."""
    element = node.find(f".//{{*}}{tag}")
    if element is not None and element.text:
        return element.text.strip()
    return ""


def node_link(node: ET.Element) -> str:
    # RSS style
    link_text = node_text(node, "link")
    if link_text:
        return link_text

    # Atom style with href attribute
    for child in node.findall(".//{*}link"):
        href = child.attrib.get("href")
        if href:
            return href.strip()
    return ""


def node_summary(node: ET.Element) -> str:
    for tag in ("description", "summary", "content", "encoded"):
        text = node_text(node, tag)
        if text:
            return text
    return ""


def node_datetime(node: ET.Element) -> Optional[datetime]:
    for tag in ("pubDate", "published", "updated", "date"):
        raw = node_text(node, tag)
        if not raw:
            continue
        dt = parse_datetime(raw)
        if dt:
            return dt
    return None


def parse_datetime(value: str) -> Optional[datetime]:
    value = value.strip()
    try:
        dt = parsedate_to_datetime(value)
        if dt is not None:
            if dt.tzinfo is None:
                dt = dt.replace(tzinfo=timezone.utc)
            return dt
    except (TypeError, ValueError):
        pass

    # Fallback to ISO 8601 parsing
    try:
        dt = datetime.fromisoformat(value.replace("Z", "+00:00"))
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        return dt
    except ValueError:
        return None


def fetch_source(source: Dict[str, str]) -> List[Dict[str, str]]:
    try:
        with request.urlopen(source["url"], timeout=25) as response:
            xml_bytes = response.read()
    except error.URLError as exc:
        print(f"[WARN] {source['name']} fetch failed: {exc}", file=sys.stderr)
        return []

    try:
        root = ET.fromstring(xml_bytes)
    except ET.ParseError as exc:
        print(f"[WARN] {source['name']} XML parse error: {exc}", file=sys.stderr)
        return []

    items = root.findall('.//item')
    if not items:
        items = root.findall('.//{http://www.w3.org/2005/Atom}entry')

    entries = []
    for node in items:
        published = node_datetime(node) or datetime.now(timezone.utc)
        published_local = published.astimezone(TARGET_TZ)
        entry = {
            "source_id": source["id"],
            "source": source["name"],
            "title": node_text(node, "title") or "(无标题)",
            "summary": node_summary(node) or "",
            "published_at": published.isoformat(),
            "published_local": published_local.isoformat(),
            "date": published_local.strftime("%Y-%m-%d"),
            "url": node_link(node),
        }
        entries.append(entry)
    return entries


def collect_entries() -> List[Dict[str, str]]:
    all_items: List[Dict[str, str]] = []
    for source in SOURCES:
        all_items.extend(fetch_source(source))
    return all_items


def ensure_storage_dir() -> Path:
    repo_root = Path(__file__).resolve().parents[3]
    storage_dir = repo_root / "storage" / "pharma-news"
    storage_dir.mkdir(parents=True, exist_ok=True)
    return storage_dir


def output_payload(date_key: str, entries: List[Dict[str, str]]) -> Dict[str, object]:
    now = datetime.now(timezone.utc).astimezone(TARGET_TZ)
    return {
        "date": date_key,
        "generated_at": now.isoformat(),
        "source_count": len({item["source_id"] for item in entries}),
        "item_count": len(entries),
        "items": sorted(entries, key=lambda item: item["published_local"], reverse=True),
    }


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Fetch pharma RSS feeds and store JSON payloads")
    parser.add_argument("--date", help="Target date in YYYY-MM-DD (default: today, UTC+8)")
    parser.add_argument("--date-range", action="store_true", help="Print available date range and exit")
    return parser.parse_args()


def main():
    args = parse_args()
    entries = collect_entries()
    if not entries:
        print("No entries retrieved.", file=sys.stderr)
        sys.exit(1)

    grouped: Dict[str, List[Dict[str, str]]] = {}
    for item in entries:
        grouped.setdefault(item["date"], []).append(item)

    if args.date_range:
        dates = sorted(grouped.keys())
        payload = {
            "dates": dates,
            "start": dates[0] if dates else None,
            "end": dates[-1] if dates else None,
            "source_total": len(SOURCES),
            "items": sum(len(v) for v in grouped.values()),
        }
        print(json.dumps(payload, ensure_ascii=False, indent=2))
        return

    if args.date:
        target_date = args.date
    else:
        target_date = datetime.now(TARGET_TZ).strftime("%Y-%m-%d")

    day_entries = grouped.get(target_date, [])
    if not day_entries:
        available = sorted(grouped.keys())
        message = {
            "error": f"No pharma news for {target_date}",
            "available_dates": available[-5:],
        }
        print(json.dumps(message, ensure_ascii=False, indent=2))
        sys.exit(2)

    payload = output_payload(target_date, day_entries)
    storage_dir = ensure_storage_dir()
    output_path = storage_dir / f"{target_date}.json"
    with output_path.open("w", encoding="utf-8") as fp:
        json.dump(payload, fp, ensure_ascii=False, indent=2)

    print(f"Saved {payload['item_count']} items to {output_path}")


if __name__ == "__main__":
    main()
