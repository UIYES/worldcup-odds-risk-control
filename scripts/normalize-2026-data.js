// 2026 世界杯数据标准化脚本
//
// 说明：
//   - 把 scripts/fetch-2026-data.js 抓到的原始数据（或第三方 API 返回的原始数据）
//     转换成项目使用的标准字段结构，和 matches-2022.js 保持一致。
//   - 不修改正式模型，只做数据字段的重命名、补齐和校验。
//   - 校验失败的数据不会写入 JSON，以免页面崩溃。
//
// 运行方式：
//   node scripts/normalize-2026-data.js <raw-input.json>
//   （目前输入仍是 fetch-2026-data.js 生成的 fallback 数据，未来接入真实 API 后再扩展）

const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(__dirname, "..", "data");
const MATCHES_JSON = path.join(DATA_DIR, "matches-2026.json");

const REQUIRED_FIELDS = ["id", "date", "stage", "home", "away"];

const SCORE_KEYS = ["1:0", "2:0", "2:1", "1:1", "0:1", "0:0", "0:2", "1:2", "2:2", "3:0", "3:1"];

function ensureFields(raw) {
  const normalized = {
    id: typeof raw.id === "number" ? raw.id : Date.now(),
    date: raw.date || "",
    stage: raw.stage || "小组赛",
    home: raw.home || "",
    away: raw.away || "",
    actual: raw.actual || "",
    finalScore: raw.finalScore || "",
    predict: raw.predict || "等待自动数据",
    confidence: typeof raw.confidence === "number" ? raw.confidence : 0,
    resultCorrect: typeof raw.resultCorrect === "boolean" ? raw.resultCorrect : false,
    probs: {
      home: Number(raw.probs && raw.probs.home) || 0,
      draw: Number(raw.probs && raw.probs.draw) || 0,
      away: Number(raw.probs && raw.probs.away) || 0
    },
    goals: raw.goals && Array.isArray(raw.goals)
      ? raw.goals.map(g => [String(g[0]), Number(g[1]) || 0])
      : [["0-1球", 0], ["2-3球", 0], ["4球以上", 0]],
    scoreOdds: raw.scoreOdds && typeof raw.scoreOdds === "object" ? raw.scoreOdds : {},
    scoreProb: raw.scoreProb && Array.isArray(raw.scoreProb)
      ? raw.scoreProb.map(p => [String(p[0]), Number(p[1]) || 0])
      : [],
    handicap: {
      line: (raw.handicap && raw.handicap.line) || "",
      timeline: (raw.handicap && raw.handicap.timeline) || [],
      homeWater: (raw.handicap && raw.handicap.homeWater) || [],
      awayWater: (raw.handicap && raw.handicap.awayWater) || [],
      signal: (raw.handicap && raw.handicap.signal) || ""
    },
    news: Array.isArray(raw.news) ? raw.news.map(n => String(n)) : []
  };
  if (raw._mock) normalized._mock = true;
  return normalized;
}

function validate(match) {
  for (const f of REQUIRED_FIELDS) {
    if (!match[f]) return { valid: false, reason: `缺少字段 ${f}` };
  }
  if (match.actual && !/^\d+:\d+$/.test(match.actual)) {
    return { valid: false, reason: `actual 字段格式异常：${match.actual}` };
  }
  return { valid: true };
}

function normalize(rawMatches) {
  const results = [];
  const errors = [];
  rawMatches.forEach((raw, idx) => {
    const n = ensureFields(raw);
    const v = validate(n);
    if (v.valid) {
      results.push(n);
    } else {
      errors.push(`第 ${idx + 1} 条：${v.reason}，已跳过`);
    }
  });
  return { matches: results, errors };
}

function loadFromJsonOrFallback(inputPath) {
  if (inputPath && fs.existsSync(inputPath)) {
    const content = fs.readFileSync(inputPath, "utf8");
    try {
      return JSON.parse(content);
    } catch (e) {
      console.error(`[normalize-2026] ${inputPath} 不是合法 JSON：${e.message}`);
      process.exit(1);
    }
  }
  // 默认读取 matches-2026.json 中已存在的数据
  if (fs.existsSync(MATCHES_JSON)) {
    try {
      return JSON.parse(fs.readFileSync(MATCHES_JSON, "utf8"));
    } catch (e) {
      return [];
    }
  }
  return [];
}

function writeMatchesJson(list) {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(MATCHES_JSON, JSON.stringify(list, null, 2), "utf8");
}

function run() {
  const inputPath = process.argv[2];
  const raw = loadFromJsonOrFallback(inputPath);
  const { matches, errors } = normalize(Array.isArray(raw) ? raw : []);
  writeMatchesJson(matches);
  console.log(`[normalize-2026] 标准化完成：共 ${matches.length} 场，跳过 ${errors.length} 条异常。`);
  if (errors.length) errors.forEach(e => console.log(`  - ${e}`));
}

module.exports = { normalize, ensureFields, validate };

if (require.main === module) run();
