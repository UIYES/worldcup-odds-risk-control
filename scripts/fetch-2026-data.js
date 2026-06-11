// 2026 世界杯数据抓取脚本（自动更新架构 - 雏形）
//
// 说明：
//   - 本脚本在 GitHub Actions 中定期运行，生成 data/matches-2026.json 和 data/source-status.json。
//   - 目前主要跑 mock/fallback 数据，真实数据源需要 API Key，见 PENDING_DECISIONS.md 和 .env.example。
//   - 不修改正式评分逻辑，只做数据抓取和写入。
//   - 不接入任何需要账号、API Key 或付费的数据源（等用户确认）。
//
// 运行方式：
//   node scripts/fetch-2026-data.js
//   或配合 GitHub Actions：见 .github/workflows/update-2026-data.yml
//
// 可用的数据源类型（都需要进一步调研和用户确认）：
//   - 赛程/结果：FIFA 官网、维基、sports-data 聚合 API
//   - 胜平负/让球/大小球/波胆赔率：需要专业博彩 API（通常付费或需要 API Key）
//   - 新闻/伤停/首发：球队官网、新闻聚合 API

const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(__dirname, "..", "data");
const MATCHES_JSON = path.join(DATA_DIR, "matches-2026.json");
const STATUS_JSON = path.join(DATA_DIR, "source-status.json");

// 数据源清单 —— 全部只做调研记录，不实际抓取
const DATA_SOURCES = [
  {
    key: "fixture",
    name: "赛程与赛果",
    description: "2026 世界杯比赛日期、阶段、对阵、比分。",
    needsApiKey: true,
    free: false,
    candidates: [
      { name: "FIFA 官网赛程页（公开 HTML）", type: "HTML 页面", status: "待调研是否允许抓取" },
      { name: "Sportmonks / API-Football / Football-Data.org 等", type: "REST API", status: "需要 API Key，部分免费额度" },
      { name: "维基百科 2026 FIFA World Cup 条目", type: "结构化表格", status: "公开可读，更新频率依赖编辑" }
    ],
    requiredFor: ["date", "stage", "home", "away", "actual", "finalScore"]
  },
  {
    key: "odds-1x2",
    name: "胜平负赔率",
    description: "赛前 1x2（主胜 / 平局 / 客胜）赔率。",
    needsApiKey: true,
    free: false,
    candidates: [
      { name: "The Odds API（the-odds-api.com）", type: "REST API", status: "免费额度约 500 请求/月，更多需付费；需 API Key" },
      { name: "OddsJam / Sportmonks Football", type: "REST API", status: "需 API Key / 付费" }
    ],
    requiredFor: ["probs.home", "probs.draw", "probs.away"]
  },
  {
    key: "odds-handicap",
    name: "让球盘口与水位",
    description: "亚洲让球盘（主队让几球），以及多家公司在不同时点的水位。",
    needsApiKey: true,
    free: false,
    candidates: [
      { name: "The Odds API（h2h / spreads 端点）", type: "REST API", status: "需 API Key" },
      { name: "专业博彩 API（Bet365 / Pinnacle 等数据商）", type: "REST API", status: "需 API Key / 多数付费" }
    ],
    requiredFor: ["handicap.line", "handicap.timeline[].homeWater / awayWater"]
  },
  {
    key: "odds-totals",
    name: "大小球盘口与水位",
    description: "总进球数盘口（2.5 球 / 3 球等）和大小球水位。",
    needsApiKey: true,
    free: false,
    candidates: [
      { name: "The Odds API（totals 端点）", type: "REST API", status: "需 API Key" }
    ],
    requiredFor: ["goals[].名称与概率"]
  },
  {
    key: "odds-correct-score",
    name: "波胆赔率",
    description: "各个比分（1:0, 2:1, 0:0 ...）的赔率。",
    needsApiKey: true,
    free: false,
    candidates: [
      { name: "Sportmonks / 专业博彩 API", type: "REST API", status: "需 API Key / 付费" }
    ],
    requiredFor: ["scoreOdds", "scoreProb"]
  },
  {
    key: "news",
    name: "新闻 / 伤停 / 首发",
    description: "球队伤停、赛前首发、天气等对赔率有影响的信息。",
    needsApiKey: true,
    free: false,
    candidates: [
      { name: "球队官网 / 官方推特", type: "网页", status: "公开可读，需要整理" },
      { name: "专业体育新闻 API（API-Football 含 fixtures 信息）", type: "REST API", status: "部分免费" }
    ],
    requiredFor: ["news[]"]
  }
];

function nowISO() {
  return new Date().toISOString();
}

// 生成 fallback / mock 数据 —— 保持与 data/matches-2022.js 相同的字段结构，
// 但内容用"占位"表示，不会进入正式模型分析的结果。
function buildFallbackMatches() {
  // 2026 世界杯 美加墨：共 48 支球队，小组赛 12 组 × 每组 4 队 × 6 场 = 72 场小组赛，
  // 后续还有淘汰赛。这里只做少量占位，真实数据需要自动抓取。
  return [
    {
      id: 26001,
      date: "2026-06-11",
      stage: "小组赛",
      home: "（待自动抓取）",
      away: "（待自动抓取）",
      actual: "",
      finalScore: "",
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
    }
  ];
}

function buildSourceStatus(runResult) {
  return {
    generatedAt: nowISO(),
    generatedBy: "scripts/fetch-2026-data.js",
    mode: runResult.mode, // "mock" 或 "real"
    runSuccess: runResult.success,
    runMessage: runResult.message,
    sources: DATA_SOURCES.map(s => ({
      key: s.key,
      name: s.name,
      description: s.description,
      needsApiKey: s.needsApiKey,
      free: s.free,
      configured: false,
      lastFetch: null,
      lastFetchError: null
    }))
  };
}

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function withoutTimestamps(obj) {
  // 比较内容时忽略 generatedAt 等时间字段，避免每次都产生 diff
  if (Array.isArray(obj)) return obj.map(withoutTimestamps);
  if (obj && typeof obj === "object") {
    const copy = {};
    Object.keys(obj).forEach(k => {
      if (k === "generatedAt" || k === "lastFetch") return;
      copy[k] = withoutTimestamps(obj[k]);
    });
    return copy;
  }
  return obj;
}

function contentDiffersFromFile(path, newObj) {
  if (!fs.existsSync(path)) return true;
  try {
    const existing = JSON.parse(fs.readFileSync(path, "utf8"));
    const existingCore = JSON.stringify(withoutTimestamps(existing));
    const newCore = JSON.stringify(withoutTimestamps(newObj));
    return existingCore !== newCore;
  } catch (e) {
    return true;
  }
}

function writeMatchesJson(list) {
  ensureDir();
  if (!contentDiffersFromFile(MATCHES_JSON, list)) {
    console.log("[fetch-2026] matches-2026.json 内容无变化，跳过重写");
    return false;
  }
  fs.writeFileSync(MATCHES_JSON, JSON.stringify(list, null, 2), "utf8");
  console.log(`[fetch-2026] 已写入 data/matches-2026.json（${list.length} 场）`);
  return true;
}

function writeStatusJson(runResult) {
  ensureDir();
  const status = buildSourceStatus(runResult);
  // 如果内容（除生成时间）与现有文件相同就不写，避免 mock 模式下频繁无意义 commit
  if (!contentDiffersFromFile(STATUS_JSON, status)) {
    console.log("[fetch-2026] source-status.json 内容无变化，跳过重写");
    return false;
  }
  fs.writeFileSync(STATUS_JSON, JSON.stringify(status, null, 2), "utf8");
  console.log(`[fetch-2026] 已写入 data/source-status.json（mode=${runResult.mode}）`);
  return true;
}

function run() {
  // 当前策略：
  //   - 如果没有任何 API Key 被配置（这是默认），就跑 mock/fallback。
  //   - 这样 GitHub Actions workflow 就不会失败，页面也能看到"当前为 mock 数据"的标注。
  //   - 等用户确认并配置数据源后，此处会改为调用真实 API。
  const hasAnyKey = Object.keys(process.env)
    .some(key => key.startsWith("WORLDCUP_") && process.env[key] && process.env[key].length > 0);

  if (!hasAnyKey) {
    const matches = buildFallbackMatches();
    writeMatchesJson(matches);
    const result = {
      success: true,
      mode: "mock",
      message: "当前无 API Key 配置，写入 mock/fallback 数据。配置数据源后会自动切换为真实数据。"
    };
    writeStatusJson(result);
    console.log("[fetch-2026] 完成：mock 模式。");
    return;
  }

  // 有 API Key 时：
  // 这里保留一个"预留位置"，方便未来实现真实抓取逻辑。
  // 接入任何真实数据源前，需要用户在 PENDING_DECISIONS.md 中确认。
  const matches = buildFallbackMatches();
  writeMatchesJson(matches);
  const result = {
    success: true,
    mode: "mock",
    message: "检测到可能有 API Key 配置，但当前分支仍保留为 mock 模式（需要用户确认后再接入）。"
  };
  writeStatusJson(result);
  console.log("[fetch-2026] 完成：保留 mock 模式（需要用户确认后接入真实数据源）。");
}

// 导出，方便测试
module.exports = { DATA_SOURCES, buildFallbackMatches, buildSourceStatus };

// 直接执行
if (require.main === module) {
  run();
}
