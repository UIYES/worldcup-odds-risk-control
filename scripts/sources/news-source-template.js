// 新闻/伤停/首发 源 adapter 模板
//
// 目标：赛前新闻、球队伤停、首发阵容，影响赔率判断
//
// 接入前需确认：
//   1. 来源是否允许程序访问
//   2. 是否需要 API Key
//   3. 是否涉及版权数据或个人信息
// 接入前请在 PENDING_DECISIONS.md 登记，等待你确认后再启用。
//
// 候选新闻源：
//   - 球队官网（公开 HTML，需确认合规）
//   - 维基体育新闻聚合
//   - Transfermarkt / 其他球队站（公开 HTML）

"use strict";

const fs = require("fs");
const path = require("path");

function fetchNews() {
  // TODO: 接入真实新闻源后实现真实 fetch。
  return {
    provider: "news-source-template (MOCK)",
    fetchedAt: new Date().toISOString(),
    matches: []
  };
}

function normalize(rawMatches) {
  if (!Array.isArray(rawMatches) || rawMatches.length === 0) return [];
  return rawMatches.map((m, idx) => ({
    id: `news-${idx}`,
    news: Array.isArray(m.news) ? m.news.filter(n => typeof n === "string") : ["等待自动数据源"]
  }));
}

function run() {
  const raw = fetchNews();
  const normalized = normalize(raw.matches);
  const OUT = path.join(__dirname, "..", "..", "data", "news-template-output.json");
  const DATA_DIR = path.dirname(OUT);
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify({ ...raw, matches: normalized }, null, 2), "utf8");
  console.log(`[news-source-template] 写入 ${OUT}（当前为模板占位，接入真实源后启用）`);
  return normalized;
}

if (require.main === module) run();

module.exports = { fetchNews, normalize, run };
