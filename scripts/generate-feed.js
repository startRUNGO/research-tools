#!/usr/bin/env node
/**
 * generate-feed.js - Generate RSS feed from papers data
 */

const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', 'data');
const outFile = path.join(__dirname, '..', 'feed.xml');

// Load all papers
let papers = [];
try {
    const index = JSON.parse(fs.readFileSync(path.join(dataDir, 'papers-index.json'), 'utf-8'));
    index.forEach(date => {
        const file = path.join(dataDir, 'papers', date + '.json');
        if (fs.existsSync(file)) {
            const data = JSON.parse(fs.readFileSync(file, 'utf-8'));
            if (Array.isArray(data)) papers = papers.concat(data);
        }
    });
} catch {
    try {
        papers = JSON.parse(fs.readFileSync(path.join(dataDir, 'papers.json'), 'utf-8'));
    } catch { papers = []; }
}

// Sort by date descending, limit to 50
papers.sort((a, b) => b.date.localeCompare(a.date));
papers = papers.slice(0, 50);

const escXml = s => (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

let items = papers.map(p => {
    const link = p.url || (p.arxiv ? `https://arxiv.org/abs/${p.arxiv}` : '') || (p.doi ? `https://doi.org/${p.doi}` : 'https://startrungo.github.io/research-tools/#paper-digest');
    const highlights = (p.highlights || []).map(h => `• ${h}`).join('\n');
    const desc = `${p.abstract || ''}\n\n${highlights}\n\n${p.comment || ''}`.trim();

    return `    <item>
      <title>${escXml(p.title)}</title>
      <link>${escXml(link)}</link>
      <guid>${escXml(p.id)}</guid>
      <pubDate>${new Date(p.date).toUTCString()}</pubDate>
      <category>${escXml(p.field)}</category>
      <description>${escXml(desc)}</description>
    </item>`;
}).join('\n');

const feed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Research Tools Hub - Paper Digest</title>
    <link>https://startrungo.github.io/research-tools/#paper-digest</link>
    <description>Daily curated papers from top journals in Federated Learning, IoV Security, TinyML, Virtual Power Plant, and Energy Management.</description>
    <language>en</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="https://startrungo.github.io/research-tools/feed.xml" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>
`;

fs.writeFileSync(outFile, feed, 'utf-8');
console.log(`RSS feed generated: ${papers.length} items → ${outFile}`);
