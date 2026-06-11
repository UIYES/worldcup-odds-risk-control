// FIFA 2026 世界杯赛程/比分源
//
// 说明：
//   这是自动数据源架构中的“赛程/赛果”adapter。
//   目标：从 FIFA 官网 / 公开可用的赛程来源获取：
//     - 比赛日期、阶段、分组、场地
//     - 主队 / 客队
//     - 最终比分（赛后）
//   不抓取任何受版权保护的赔率数据。
//   不绕过任何登录/付费/限流限制。
//   不写入任何 API Key 到仓库。
//
// 运行方式：
//   node scripts/sources/fifa-schedule.js
//   或由 .github/workflows/update-2026-data.yml 手动触发。
//
// 当前状态（2026-06-11）：
//   FIFA 2026 具体赛程尚未在官网公开（或需要人工/API Key 访问）。
//   本脚本目前返回一个空列表并将 matches-2026.json 维持为
//   "等待真实赛程" 占位状态。
//   一旦 FIFA 发布公开赛程 / 提供 API，就在下方 TODO 处实现真实抓取逻辑。

const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(__dirname, "..", "..", "data");
const OUT_PATH = path.join(DATA_DIR, "matches-2026.schedule.json");

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

function buildPlaceholder() {
  // TODO: 接入真实 FIFA 赛程源后，在此处替换为真实抓取逻辑。
  // 候选来源：
  //   - FIFA 官网 fixtures 页（公开 HTML，需确认抓取合规）
  //   - FIFA 公开 JSON API（如果开放）
  //   - 维基百科 FIFA World Cup 2026 条目（公开可编辑表格）
  // 接入前请在 PENDING_DECISIONS.md 登记，等待你确认后再启用。
  return {
    generatedAt: new Date().toISOString(),
    source: "fifa-schedule-adapter (placeholder)",
    status: "waiting",
    matches: []
  };
}

function run() {
  ensureDir();
  const data = buildPlaceholder();
  fs.writeFileSync(OUT_PATH, JSON.stringify(data, null, 2), "utf8");
  console.log(`[fifa-schedule] 写入 ${OUT_PATH}（当前为占位状态，等待 FIFA 公开赛程后再启用真实抓取）`);
  return data;
}

if (require.main === module) run();

module.exports = { run };
