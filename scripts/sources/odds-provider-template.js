// 赔率源 adapter 模板（请勿提交真实 API Key）
//
// 目标：胜平负 / 让球 / 大小球 / 波胆赔率
//
// 接入前需确认：
//   1. 数据源是否允许程序访问（看 robots.txt / Terms of Use）
//   2. 是否需要 API Key、付费额度
//   3. 是否涉及版权数据
// 以上任一问题未确认前：不要写真实抓取逻辑，保持 mock/fallback 模式。
//
// 候选赔率源（需你确认）：
//   - The Odds API（the-odds-api.com）：免费额度约 500 请求/月
//   - OddsJam / Sportmonks Football / API-Football
//   - 其他博彩聚合 API
//
// 使用方式：
//   1) 复制本模板，改名成具体源（如 the-odds-api.js）
//   2) 实现 fetchOdds()，从该源取 JSON
//   3) normalize() 转换为项目统一字段
//   4) 在 PENDING_DECISIONS.md 登记后，再连到 scripts/fetch-2026-data.js
//
// 环境变量（从 .env 或 GitHub Secrets 读，不要写死到文件）：
//   WORLDCUP_THE_ODDS_API_KEY=xxxxxx
//   WORLDCUP_API_FOOTBALL_KEY=xxxxxx
//   WORLDCUP_SPORTMONKS_KEY=xxxxxx

"use strict";

const fs = require("fs");
const path = require("path");

// 模板接口：
//   fetchOdds(): 返回赔率原始 JSON（当前是 mock）
//   normalize(raw): 把原始 JSON 转成项目标准字段
//   run(): 执行并写入 JSON

function fetchOdds() {
  // TODO: 接入真实赔率源后实现真实 fetch。
  // 暂时返回占位结构，表明"有哪些字段需要填充"。
  return {
    provider: "odds-provider-template (MOCK)",
    fetchedAt: new Date().toISOString(),
    matches: []
  };
}

function normalize(rawMatches) {
  // 转换为项目标准字段（与 data/matches-2026.js 同结构）
  if (!Array.isArray(rawMatches) || rawMatches.length === 0) return [];
  return rawMatches.map((m, idx) => ({
    id: `tpl-${idx}`,
    date: m.date || "",
    stage: m.stage || "小组赛",
    home: m.home || "",
    away: m.away || "",
    actual: m.actual || "",
    finalScore: m.finalScore || "",
    predict: "等待自动数据",
    confidence: 0,
    resultCorrect: false,
    probs: { home: 0, draw: 0, away: 0 },
    goals: [["0-1球", 0], ["2-3球", 0], ["4球以上", 0]],
    scoreOdds: {},
    scoreProb: [],
    handicap: {
      line: "",
      timeline: [],
      homeWater: [],
      awayWater: [],
      signal: "等待自动数据"
    },
    news: ["等待自动数据源"],
    _mock: true
  }));
}

function run() {
  const raw = fetchOdds();
  const normalized = normalize(raw.matches);
  const OUT = path.join(__dirname, "..", "..", "data", "odds-template-output.json");
  const DATA_DIR = path.dirname(OUT);
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify({ ...raw, matches: normalized }, null, 2), "utf8");
  console.log(`[odds-provider-template] 写入 ${OUT}（当前为模板占位，接入真实源后启用）`);
  return normalized;
}

if (require.main === module) run();

module.exports = { fetchOdds, normalize, run };
