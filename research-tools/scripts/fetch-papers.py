#!/usr/bin/env python3
"""
Daily Paper Fetcher - 每日论文自动搜集
======================================
从 arXiv API 搜索相关论文，用 Claude API 生成摘要和亮点分析，
输出符合 paper-digest 格式的 JSON。

研究方向: Federated Learning, IoV Security, Intrusion Detection, TinyML,
          Virtual Power Plant, Energy Management
"""

import json
import os
import sys
import urllib.request
import urllib.parse
import xml.etree.ElementTree as ET
from datetime import datetime, timedelta

# ============================================================
# 配置
# ============================================================
ANTHROPIC_API_KEY = os.environ.get("ANTHROPIC_API_KEY", "")
MODEL = "claude-sonnet-4-20250514"
MAX_PAPERS_PER_QUERY = 10
MAX_TOTAL_PAPERS = 20

# 搜索主题（arXiv 查询）
SEARCH_QUERIES = [
    # Federated Learning + IoV/Vehicle
    '(ti:"federated learning" AND (ti:"vehicle" OR ti:"IoV" OR ti:"vehicular" OR ti:"intrusion detection"))',
    # TinyML / Edge AI
    '(ti:"TinyML" OR (ti:"tiny" AND ti:"machine learning") OR (ti:"edge" AND ti:"intrusion detection"))',
    # Virtual Power Plant
    '(ti:"virtual power plant" OR (ti:"VPP" AND (ti:"energy" OR ti:"grid")))',
    # Energy Management + ML
    '(ti:"energy management" AND (ti:"federated" OR ti:"deep learning" OR ti:"reinforcement learning"))',
    # Intrusion Detection + Lightweight
    '(ti:"intrusion detection" AND (ti:"lightweight" OR ti:"edge" OR ti:"IoT" OR ti:"pruning"))',
]

# 主题到 field 的映射
FIELD_MAPPING = {
    "federated": "AI/ML",
    "intrusion detection": "Security",
    "virtual power plant": "VPP",
    "vpp": "VPP",
    "energy management": "Energy",
    "tinyml": "AI/ML",
    "tiny machine learning": "AI/ML",
}


def fetch_arxiv(query, max_results=10):
    """从 arXiv API 搜索论文"""
    params = urllib.parse.urlencode({
        "search_query": query,
        "start": 0,
        "max_results": max_results,
        "sortBy": "submittedDate",
        "sortOrder": "descending",
    })
    url = f"http://export.arxiv.org/api/query?{params}"

    try:
        req = urllib.request.Request(url, headers={"User-Agent": "ResearchToolsHub/1.0"})
        with urllib.request.urlopen(req, timeout=30) as resp:
            data = resp.read().decode("utf-8")
    except Exception as e:
        print(f"  [WARN] arXiv fetch failed for query: {e}", file=sys.stderr)
        return []

    ns = {"atom": "http://www.w3.org/2005/Atom", "arxiv": "http://arxiv.org/schemas/atom"}
    root = ET.fromstring(data)
    papers = []

    for entry in root.findall("atom:entry", ns):
        title = entry.find("atom:title", ns).text.strip().replace("\n", " ")
        abstract = entry.find("atom:summary", ns).text.strip().replace("\n", " ")
        authors = ", ".join(
            a.find("atom:name", ns).text for a in entry.findall("atom:author", ns)
        )
        # Shorten author list
        author_list = authors.split(", ")
        if len(author_list) > 3:
            authors = ", ".join(author_list[:3]) + ", et al."

        arxiv_id = entry.find("atom:id", ns).text.split("/abs/")[-1]
        published = entry.find("atom:published", ns).text[:10]

        # Categories
        categories = [
            c.get("term") for c in entry.findall("atom:category", ns)
        ]

        papers.append({
            "arxiv_id": arxiv_id,
            "title": title,
            "authors": authors,
            "abstract": abstract,
            "published": published,
            "categories": categories,
        })

    return papers


def determine_field(title, abstract):
    """根据标题和摘要确定 field"""
    text = (title + " " + abstract).lower()
    if "virtual power plant" in text or "vpp" in text:
        return "VPP"
    if "energy management" in text:
        return "Energy"
    if "intrusion detection" in text or "anomaly detection" in text:
        return "Security"
    return "AI/ML"


def analyze_with_claude(papers):
    """用 Claude API 分析论文，生成亮点和评论"""
    if not ANTHROPIC_API_KEY:
        print("  [WARN] No ANTHROPIC_API_KEY, using basic analysis", file=sys.stderr)
        return basic_analysis(papers)

    papers_text = ""
    for i, p in enumerate(papers):
        papers_text += f"\n--- Paper {i+1} ---\n"
        papers_text += f"Title: {p['title']}\n"
        papers_text += f"Authors: {p['authors']}\n"
        papers_text += f"Abstract: {p['abstract']}\n"

    prompt = f"""分析以下{len(papers)}篇论文，为每篇提供：
1. highlights: 3个核心亮点（中文，每条一句话）
2. comment: 简短评论（中文，1-2句话，指出创新点和不足）
3. tags: 5-6个标签（中文，如"联邦学习"、"车联网"等）

研究视角：联邦学习 × 车联网安全 × 入侵检测 × TinyML × 虚拟电厂 × 能源管理

严格按以下JSON格式输出，不要其他文字：
[
  {{
    "index": 0,
    "highlights": ["亮点1", "亮点2", "亮点3"],
    "comment": "评论",
    "tags": ["标签1", "标签2"]
  }}
]

{papers_text}"""

    body = json.dumps({
        "model": MODEL,
        "max_tokens": 4096,
        "messages": [{"role": "user", "content": prompt}],
    })

    req = urllib.request.Request(
        "https://api.anthropic.com/v1/messages",
        data=body.encode("utf-8"),
        headers={
            "Content-Type": "application/json",
            "x-api-key": ANTHROPIC_API_KEY,
            "anthropic-version": "2023-06-01",
        },
    )

    try:
        with urllib.request.urlopen(req, timeout=120) as resp:
            result = json.loads(resp.read().decode("utf-8"))

        text = result["content"][0]["text"]
        # Extract JSON from response
        if "```" in text:
            text = text.split("```")[1]
            if text.startswith("json"):
                text = text[4:]
        bracket_start = text.find("[")
        bracket_end = text.rfind("]")
        if bracket_start != -1 and bracket_end > bracket_start:
            text = text[bracket_start:bracket_end + 1]

        analyses = json.loads(text)
        return analyses
    except Exception as e:
        print(f"  [WARN] Claude API failed: {e}, using basic analysis", file=sys.stderr)
        return basic_analysis(papers)


def basic_analysis(papers):
    """无 API 时的基础分析"""
    results = []
    for i, p in enumerate(papers):
        title_lower = p["title"].lower()
        tags = []
        if "federated" in title_lower:
            tags.append("联邦学习")
        if "intrusion" in title_lower or "detection" in title_lower:
            tags.append("入侵检测")
        if "vehicle" in title_lower or "iov" in title_lower or "vehicular" in title_lower:
            tags.append("车联网")
        if "tiny" in title_lower or "edge" in title_lower or "lightweight" in title_lower:
            tags.append("轻量化")
        if "power plant" in title_lower or "vpp" in title_lower:
            tags.append("虚拟电厂")
        if "energy" in title_lower:
            tags.append("能源管理")
        if "reinforcement" in title_lower:
            tags.append("强化学习")
        if "deep learning" in title_lower or "neural" in title_lower:
            tags.append("深度学习")
        if not tags:
            tags = ["机器学习"]

        results.append({
            "index": i,
            "highlights": [
                f"研究{p['title'][:30]}...的新方法",
                "详见原文摘要",
                "具有一定创新性"
            ],
            "comment": "待详细分析",
            "tags": tags,
        })
    return results


def main():
    today = datetime.utcnow().strftime("%Y-%m-%d")
    print(f"=== Daily Paper Fetch: {today} ===\n")

    # Step 1: Fetch papers from arXiv
    all_papers = []
    seen_ids = set()

    for query in SEARCH_QUERIES:
        print(f"Searching: {query[:60]}...")
        papers = fetch_arxiv(query, MAX_PAPERS_PER_QUERY)
        for p in papers:
            if p["arxiv_id"] not in seen_ids:
                seen_ids.add(p["arxiv_id"])
                all_papers.append(p)
        print(f"  Found {len(papers)} papers ({len(all_papers)} total unique)")

    if not all_papers:
        print("No papers found. Exiting.")
        sys.exit(0)

    # Filter to recent papers (last 7 days)
    cutoff = (datetime.utcnow() - timedelta(days=7)).strftime("%Y-%m-%d")
    recent = [p for p in all_papers if p["published"] >= cutoff]
    print(f"\nRecent papers (after {cutoff}): {len(recent)}")

    if not recent:
        # Fallback: use most recent papers regardless of date
        recent = sorted(all_papers, key=lambda p: p["published"], reverse=True)[:MAX_TOTAL_PAPERS]
        print(f"Using {len(recent)} most recent papers instead")

    # Limit total
    recent = recent[:MAX_TOTAL_PAPERS]

    # Step 2: Analyze with Claude
    print(f"\nAnalyzing {len(recent)} papers...")
    analyses = analyze_with_claude(recent)

    # Step 3: Build output JSON
    output = []
    for i, p in enumerate(recent):
        analysis = next((a for a in analyses if a.get("index") == i), None)
        if not analysis:
            analysis = {"highlights": [], "comment": "", "tags": []}

        field = determine_field(p["title"], p["abstract"])
        paper_id = f"pd-{today.replace('-', '')}-{str(i+1).zfill(2)}"

        output.append({
            "id": paper_id,
            "date": today,
            "title": p["title"],
            "authors": p["authors"],
            "journal": "arXiv",
            "field": field,
            "arxiv": p["arxiv_id"],
            "url": f"https://arxiv.org/abs/{p['arxiv_id']}",
            "abstract": p["abstract"][:300],
            "highlights": analysis.get("highlights", []),
            "tags": analysis.get("tags", []),
            "comment": analysis.get("comment", ""),
        })

    # Output JSON
    output_json = json.dumps(output, ensure_ascii=False, indent=2)
    print(f"\nGenerated {len(output)} papers")

    # Write to stdout or file
    output_file = os.environ.get("OUTPUT_FILE", "")
    if output_file:
        with open(output_file, "w", encoding="utf-8") as f:
            f.write(output_json)
        print(f"Written to {output_file}")
    else:
        # Write to data/papers/YYYY-MM-DD.json
        script_dir = os.path.dirname(os.path.abspath(__file__))
        data_dir = os.path.join(script_dir, "..", "data", "papers")
        os.makedirs(data_dir, exist_ok=True)
        daily_file = os.path.join(data_dir, f"{today}.json")
        with open(daily_file, "w", encoding="utf-8") as f:
            f.write(output_json)
        print(f"Written to {daily_file}")

        # Update papers-index.json
        index_file = os.path.join(script_dir, "..", "data", "papers-index.json")
        if os.path.exists(index_file):
            with open(index_file, "r", encoding="utf-8") as f:
                index = json.load(f)
        else:
            index = []

        if today not in index:
            index.insert(0, today)
            with open(index_file, "w", encoding="utf-8") as f:
                json.dump(index, f, indent=4)
            print(f"Updated papers-index.json")

    print("\nDone!")


if __name__ == "__main__":
    main()
