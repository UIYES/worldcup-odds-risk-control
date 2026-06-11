# Nightly Dev Report（trae/nightly-dev 分支）

这次开发在 `trae/nightly-dev` 分支进行，没有合并到 `main`。所有改动都遵守 PROJECT_GUARDRAILS.md 的边界：

- ✅ 没有修改正式评分引擎（engine/scoring.js、engine/config.js）
- ✅ 没有替换正式推荐逻辑（finalPrediction、riskControlScore、handicapProfile 等）
- ✅ 没有改变数据字段结构
- ✅ 没有替换 GitHub Pages 部署方式
- ✅ 没有接入真实 API 数据源（只准备了架构 + mock/fallback）

---

## 本次完成的工作

### 1. 自动数据源架构雏形（Phase 1）

| 文件 | 说明 |
|---|---|
| `scripts/fetch-2026-data.js` | 数据源抓取脚本（当前跑 mock，等用户确认后接入真实数据源） |
| `scripts/normalize-2026-data.js` | 把抓取到的原始数据标准化为项目字段结构 |
| `data/matches-2026.json` | JSON 格式的 2026 数据文件（当前只有 1 条 mock 数据） |
| `data/source-status.json` | 数据源状态记录（谁抓取的、什么时候、是否 mock） |
| `.env.example` | API Key 配置示例 |
| `.github/workflows/update-2026-data.yml` | GitHub Actions 定时抓取任务（6 小时一次，可手动触发） |
| `.gitignore` | 忽略 `.env` 和 `node_modules` |

前端改动：
- 页面加载时 `fetch('data/matches-2026.json')`，JSON 优先；失败时回退到 `data/matches-2026.js` 静态文件
- 页面显示数据源状态横幅，明确标注当前是否为 mock 数据
- 增加"2026 数据状态"视图，展示数据源候选列表和调研进度

### 2. 多视图导航和移动端优化（Phase 2）

| 视图 | 内容 |
|---|---|
| 赛事总览 | 切换届别、摘要统计（重点跟踪/等待确认/建议过滤/高冷门）、优先级看板 |
| 跨届汇总 | 2018 + 2022 跨届看板、整体命中率、比分覆盖率、进球命中率 |
| 回测复盘 | 单届回测仪表盘 + 复盘原因分布 + 需要复盘的比赛 |
| 模型建议 | 模型复盘建议 + 模型版本对比 |
| 比赛列表 | 当前赛事所有比赛 + 阶段筛选 + 点击进入单场详情 |
| 2026 数据 | 数据源状态 + 数据源候选调研列表 |

技术改动：
- 顶部新增 6 个视图导航按钮（移动端自适应）
- 视图切换用 CSS class 控制显示/隐藏
- 保留完整的单场比赛详情页

### 3. 比分覆盖优化雏形稳定化（Phase 3）

| 文件 | 改动 |
|---|---|
| `engine/score-expander.js` | 新增 `analyzeMatches` 接口，同时暴露 `ScoreExpander` 和 `ScoreExpanderEngine` 两个名称 |
| 页面"模型建议"视图 | 展示 2018 + 2022 跨届扩展前后命中率对比 |

保证：比分扩展只做模拟，不影响正式推荐结果。

### 4. 文档同步（Phase 4）

| 文件 | 改动 |
|---|---|
| `README.md` | 在顶部引用 PROJECT_GUARDRAILS.md |
| `TRAE_CODE_BOOTSTRAP.md` | 在项目目标后强调读边界文件、更新开发过程、更新开发原则 |
| `docs/DEVELOPMENT_LOG.md` | 新增自动数据源架构和多视图优化的记录 |
| `PENDING_DECISIONS.md` | 新增"需用户确认的决策列表" |

---

## 本地验证（Phase 5）

| 检查项 | 状态 |
|---|---|
| JS 文件语法（node --check） | ✅ 通过 |
| data/ 和 engine/ 模块按顺序加载 | ✅ 通过 |
| index.html 能正常打开（本地 file:// 或 http://localhost:8000 | ✅ 通过 |
| 2018、2022、2026 切届别 | ✅ 通过 |
| 跨届汇总看板 | ✅ 通过 |
| 回测仪表盘 | ✅ 通过 |
| 模型复盘建议 | ✅ 通过 |
| 模型版本对比 | ✅ 通过 |
| 比分覆盖优化模块 | ✅ 通过 |
| 数据源状态横幅（2026 视图） | ✅ 通过 |
| GitHub Actions workflow 语法 | ✅ 通过 |

---

## 需要你确认的事项（PENDING_DECISIONS.md）

1. **接入真实赔率数据源**：选哪个 API（The Odds API、API-Football、Sportmonks？免费额度够不够？
2. **是否把比分扩展策略纳入正式模型**：模拟结果显示扩展后有提升，但需要你确认是否正式采用
3. **是否重构风控评分权重**：当前权重是第一版经验规则，是否调优后确认
4. **是否引入 AI 模型**：暂不做

---

## 下一步建议

1. 你确认 PENDING_DECISIONS.md 的决策 1-4
2. 根据决策 1 选择数据源并配置 API Key
3. 把 `scripts/fetch-2026-data.js` 从 mock 模式切换为真实数据模式
4. 在 GitHub 上配置 secrets（WORLDCUP_THE_ODDS_API_KEY 等）
5. 测试定时 GitHub Actions workflow
6. 观察 2026 真实数据进来后页面分析是否合理
7. 确认 PENDING_DECISIONS.md 决策 2、3 后再考虑是否修改正式模型权重

---

## 本次改动的文件清单

**新增：**
- `scripts/fetch-2026-data.js`
- `scripts/normalize-2026-data.js`
- `data/matches-2026.json`
- `data/source-status.json`
- `.env.example`
- `.github/workflows/update-2026-data.yml`
- `.gitignore`
- `PENDING_DECISIONS.md`
- `NIGHTLY_REPORT.md`（本文件）

**修改：**
- `index.html`：多视图导航 + JSON 优先加载 + 数据源状态展示
- `engine/score-expander.js`：新增 `analyzeMatches` 接口

**未改动：**
- `engine/scoring.js`、`engine/config.js`（正式评分引擎 + 权重未动）
- `engine/backtest.js`、`engine/intent.js`、`engine/review.js`、`engine/model-advice.js`、`engine/model-version.js`、`engine/cross-tournament.js`、`engine/validate.js`
- `data/matches-2018.js`、`data/matches-2022.js`、`data/tournaments.js`
- `index-standalone.html`（备份）
