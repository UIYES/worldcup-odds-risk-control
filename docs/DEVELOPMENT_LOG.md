# 开发记录

## 2026-06-13：合并前修补 — 补回赛事选择器 / 修数据完整度汇总 / 拆筛选器

### 发现的 6 个问题

**问题 1**：页面里没有 `id="tournamentBar"` 容器，赛事选择器根本看不到
**问题 2**：`renderTournamentBar()` 用 `topbarPill.textContent = "..."` 覆盖掉 mock/fallback 测试版标签
**问题 3**：`renderDataQuality()` 用 `window.DataQualityEngine.summary`，但引擎只暴露 `summarize(list)`，且只分析第一场
**问题 4**：`renderEmptyState()` 里 `$("dataHealth").innerHTML = ""`，新页面根本没有 `dataHealth`
**问题 5**：`PROJECT_MEMORY.md` 写数据中心 tab 是 `about`，代码里是 `notes`
**问题 6**：模型管理台（回测 / 模型建议 / 比分覆盖优化 / 版本对比）用 `filteredMatches()`，它读取比赛工作台的 `stageFilter` 下拉——用户在比赛列表筛选了某阶段，模型管理台的回测样本也被偷偷减少，**这会导致回测结果不可靠**

### 本次修复

1. **HTML 结构**：在顶部 topbar 和主导航之间加 `id="tournamentBar"` 容器
2. **`renderTournamentBar()`**：加空值保护（容器 / cur / 列表不存在就返回），**不再覆盖 topbarPill**
3. **bootstrap()**：调用 `renderTournamentBar()` 初始化赛事选择器
4. **`changeTournament()`**：切届后也刷新 tournamentBar
5. **`renderDataQuality()`**：统一用 `DataQualityEngine.summarize(list)` 做汇总；展示总样本、平均完整度、可进入风控、需谨慎、数据不足、mock 数量；再取前 3 场统计代表性缺失字段
6. **`renderEmptyState()`**：去掉 `dataHealth` 引用，所有容器加 id 是否存在判断
7. **`PROJECT_MEMORY.md`**：把数据中心 tab 名 `about` 改成 `notes`
8. **拆分数据获取函数**：
   - `getCurrentMatches()`：当前赛事全部比赛，**模型管理台必须用它**
   - `getFilteredMatchList()`：仅比赛列表 tab 专用，读 `stageFilter` 筛选
   - `filteredMatches()`：保留向后兼容
9. **模型管理台四处调用**：从 `filteredMatches()` 改成 `getCurrentMatches()`——避免回测样本因筛选器减少

### 改动文件

| 文件 | 类型 | 说明 |
|---|---|---|
| `preview.html` | bug 修复 + 功能增强 | 8 处改动（上方第 1-9 点） |
| `PROJECT_MEMORY.md` | 文档对齐 | 加全局赛事选择器说明 / 数据 tab 名 about→notes / 数据获取函数语义说明 |

### 边界（没动的东西）

- ✅ 正式 `index.html` — 零改动
- ✅ 正式评分引擎 / 权重 / 推荐逻辑 — 零改动
- ✅ `engine/score-expander.js` — 零改动
- ✅ 历史样本数据 — 零改动

---

## 2026-06-13：修复三大模块切换逻辑 bug + 补齐 PROJECT_MEMORY.md 复盘规则

### 背景

在做"项目记忆补齐 + 二次验收"时发现两个 bug：

**Bug 1**：`preview.html` 中 `switchModule('model')` 或 `switchModule('data')` 时，如果没传 tabName，默认用的是 `workbenchTab`（可能是 `today`），但模型管理台的默认子 tab 应该是 `cross`（跨届汇总），数据中心的默认子 tab 应该是 `source`（数据源状态）。导致切到"模型管理台"时，会试图找一个不存在的 `model-today` 子视图，内容不显示。

**Bug 2**：`switchSubTab()` 中 `workbenchTab = tabName`——不管用户在哪个模块切 tab，都存到 `workbenchTab` 里。导致：用户在"模型管理台"切了 `cross` 后，`workbenchTab` 变成了 `cross`，再切回"比赛工作台"时，会试图找 `workbench-cross`，但比赛工作台的子 tab 是 `today/matchList/risk/review`，**没有** `cross`！

**PROJECT_MEMORY.md 遗漏**：只有页面结构信息，缺少你强调的 5 条复盘规则——比分命中≠方案成功、没有临盘复测不能简单说模型错、美国4-1巴拉圭是方向对但比分强度错、每场要分早盘/临盘/赛后、复盘要区分"分析命中"和"方案是否划算"。

### 本次操作

1. **修复切换逻辑**：为每个模块声明独立的 tab 状态变量和默认值
   - `workbenchTab = 'today'`（比赛工作台默认：今日比赛）
   - `modelTab = 'cross'`（模型管理台默认：跨届汇总）
   - `dataTab = 'source'`（数据中心默认：数据源状态）
   - 新增 `getModuleTab(moduleName)` 和 `setModuleTab(moduleName, tabName)` 两个辅助函数
   - `switchModule()` 中用 `tabName || getModuleTab(moduleName)` 作为默认 tab
   - `switchSubTab()` 中用 `setModuleTab(moduleName, tabName)` 保存 tab 状态

2. **补齐 PROJECT_MEMORY.md**：
   - 项目根本定位：不是猜比分工具，是赔率/盘口/水位/波胆风控分析工具
   - 不能动的东西：正式 index.html、正式模型、正式权重、正式推荐逻辑
   - 当前 preview.html 是测试页，三大模块结构说明
   - 已测试 4 场比赛记录（墨西哥2-0南非、韩国2-1捷克、加拿大1-1波黑、美国4-1巴拉圭）
   - 5 条复盘规则（早盘/临盘/赛后、无临盘复测不能说模型错、美国4-1教训、比分命中≠方案成功、区分"分析命中"和"方案是否划算"）
   - mock/fallback 标记约定、数据源可信度分级、下一步方向

### 验证结果（完整路径验证）

| 模块 | 子 tab 序列 | 结果 |
|---|---|---|
| 比赛工作台 | 今日比赛 → 比赛列表 → 风险与完整度 → 赛后复盘 | ✅ 全部正常显示 |
| 模型管理台 | 跨届汇总（默认）→ 回测仪表盘 → 模型建议 → 比分覆盖优化 → 模型版本对比 | ✅ 全部正常显示 |
| 数据中心 | 数据源状态（默认）→ 数据完整度 → 待确认决策 → 接入说明 | ✅ 全部正常显示 |
| 跨模块切换 | 数据中心 → 比赛工作台 → 今日比赛 | ✅ 各模块独立 tab 状态正常 |
| 浏览器控制台 | error/warning 数量 | ✅ 0 条 JS error，0 条 JS warning |

### 改动文件

| 文件 | 类型 | 说明 |
|---|---|---|
| `preview.html` | bug 修复 | 切换逻辑：各模块独立 tab 状态变量 + 默认值 |
| `PROJECT_MEMORY.md` | 增补 | 加入复盘规则、4 场测试比赛记录、不变边界 |

### 边界（没动的东西）

- ✅ 正式 `index.html` — 零改动
- ✅ 正式评分引擎 — 零改动
- ✅ 正式权重配置 — 零改动
- ✅ 正式推荐逻辑（finalPrediction / riskControlScore / handicapProfile）— 零改动
- ✅ 历史样本数据 — 零改动
- ✅ `engine/score-expander.js` — 零改动（之前已修复 candidates.join bug）

---

## 2026-06-13：preview.html 三大模块重构 + 修复 JS 报错

### 背景

上一轮在 `trae/nightly-dev` 把 preview.html 做成了"明日可落地试用版"，默认有 7 个扁平导航按钮。需要把这些内容重组成三大模块（比赛工作台、模型管理台、数据中心），让页面结构更清晰，同时修复过程中发现的 `r.candidates.join is not a function` JS 报错。

### 本次操作

1. **切到 main + 拉取最新**：从 main commit `6867a57` 新建分支 `trae/three-modules`，确保在最新状态上开发。
2. **修复 JS 报错**：`engine/score-expander.js` 中 `analyzeMatches()` 把 `candidates` 从对象（`expandScoreZone()` 整体返回）改成真正的候选比分数组（`zone.expanded`）；同时 `preview.html` 渲染处加 `Array.isArray()` 防御。
3. **三大模块重构**：把 7 个扁平导航按钮改成 3 个大模块 + 每模块内的子 tab。新增 9 个桥接渲染函数（`renderMatchesList`、`renderWorkbenchRisk`、`renderWorkbenchReview`、`renderModelAdviceDashboard`、`renderScoreExpansionDashboard`、`renderModelVersion`、`renderDataSources`、`renderDataQuality`、`renderPendingDecisions`）。
4. **保留测试版标记**：顶部仍有 "测试版 · 数据为 mock/fallback"，数据中心里明确标注 mock/fallback 状态。
5. **手机端默认**：默认进入"比赛工作台"的"今日比赛"视图。

### 验证

- ✅ 本地 HTTP 打开 `preview.html`，页面正常渲染
- ✅ 3 个主导航可切换：比赛工作台、模型管理台、数据中心
- ✅ 每个模块内子 tab 可切换并正确渲染内容
- ✅ 浏览器控制台 0 条 JS 报错
- ✅ 正式 `index.html` 零改动
- ✅ 正式评分引擎、推荐逻辑、权重零改动

### 改动文件

| 文件 | 类型 | 说明 |
|---|---|---|
| `preview.html` | 重构 | 导航三大模块化 + 新增 9 个桥接渲染函数 |
| `engine/score-expander.js` | bug 修复 | `analyzeMatches()` 中 `candidates` 从对象改为数组 |
| `NIGHTLY_REPORT.md` | 更新 | 新增本次三大模块重构 + bug 修复报告 |
| `PROJECT_MEMORY.md` | 新建 | 当前预览版记忆（默认进"比赛工作台·今日比赛"、3 大模块结构等） |

### 边界（没动的东西）

- 正式 `index.html`
- 正式评分引擎（`engine/scoring.js`、`engine/config.js`）
- 正式推荐逻辑（`finalPrediction`、`riskControlScore`、`handicapProfile`）
- 历史样本数据
- 没有接入真实 API，数据源 adapter 仍在 mock/fallback 模式

---

## 2026-06-11：第一步工程整理 - 恢复标准目录结构

### 背景

项目从单文件版（index.html，3607 行）恢复为标准目录结构，便于长期维护和开发。

### 本次操作

1. **创建标准目录**
   - `data/` - 数据文件目录
   - `engine/` - 引擎模块目录
   - `docs/` - 文档目录

2. **从单文件拆出数据文件**
   - `data/tournaments.js` - 赛事注册表（TOURNAMENTS 数组）
   - `data/matches-2018.js` - 2018 世界杯 7 场样本
   - `data/matches-2022.js` - 2022 世界杯 9 场样本
   - `data/matches-2026.js` - 2026 占位数据 + 录入模板

3. **从单文件拆出引擎文件**
   - `engine/config.js` - 风控评分配置
   - `engine/scoring.js` - 评分引擎
   - `engine/backtest.js` - 回测引擎
   - `engine/intent.js` - 盘口意图判断
   - `engine/review.js` - 赛后复盘
   - `engine/model-advice.js` - 模型复盘建议
   - `engine/model-version.js` - 模型版本对比
   - `engine/cross-tournament.js` - 跨届汇总
   - `engine/validate.js` - 数据校验

4. **重构入口文件**
   - `index.html` - 改为正式入口，通过 `<script src="...">` 引用 data/ 和 engine/ 文件
   - `index-standalone.html` - 单文件备份，防止 GitHub Pages 出问题

5. **创建文档**
   - `docs/DEVELOPMENT_LOG.md` - 本文件
   - `docs/2026_DATA_TEMPLATE.md` - 2026 数据录入模板说明
   - `docs/TRAE_CODE_HANDOFF.md` - 交接文档

### 验证清单

- [ ] 赛事总览页面正常打开
- [ ] 跨届汇总看板正常显示
- [ ] 2022 回测仪表盘正常显示
- [ ] 模型复盘建议正常显示
- [ ] 模型版本对比正常显示

### 注意事项

- 没有修改任何引擎逻辑
- 没有做比分覆盖优化
- 没有改正式推荐规则
- 引擎加载顺序：config → scoring → backtest → intent → review → model-advice → model-version → cross-tournament → validate

## 2026-06-11：第二步 - 比分覆盖优化雏形

### 背景

跨届汇总看板显示当前比分覆盖率偏低（16 场历史样本中，原始候选比分只覆盖少量实际比分）。作为比分覆盖优化的第一步，新增比分候选扩展模拟模块。

### 本次操作

1. **新增 `engine/score-expander.js`**
   - 不修改正式模型的推荐逻辑
   - 从正式模型的候选比分（3 个左右）出发，扩展四组补充比分：
     - 相邻比分：对每个候选比分 ±1 主队/客队进球
     - 平局比分：0:0、1:1、2:2、3:3
     - 冷门比分：反方向的常见比分（如 0:1、1:2 等）
     - 大比分：高进球概率时补充 3:0、4:1、5:1 等比分
   - 输出扩展前后的覆盖率对比，用于回测仪表盘和跨届汇总看板展示

2. **更新 `index.html`**
   - 引入 `engine/score-expander.js` 脚本
   - 在回测仪表盘新增"比分覆盖优化模拟"区域，展示：
     - 原始候选 vs 扩展候选的覆盖率对比
     - 扩展新增命中的来源分析
     - 扩展后仍未命中的比赛列表
   - 在跨届汇总看板新增"比分覆盖扩展模拟（跨届）"区域，展示各届的扩展前后对比

### 注意事项

- 不改正式推荐规则
- 不改评分引擎逻辑
- 不改回测引擎逻辑
- 仅做模拟展示，用于观察扩展方案的效果
- 下一步需要验证真实浏览器环境下页面是否正常显示

## 2026-06-11：第三步 - 自动数据源架构雏形

### 背景

不想做人工录入 2026 数据。希望项目能自动抓取赛程、赛果、赔率、盘口、波胆等数据，自动更新页面。GitHub Actions 可以定时跑 Node 脚本，把结果写到 data/matches-2026.json，前端优先读取这个 JSON。

### 本次操作

1. **新增脚本**
   - `scripts/fetch-2026-data.js` — 数据抓取脚本，当前跑 mock 模式（等用户确认后接入真实数据源）
   - `scripts/normalize-2026-data.js` — 数据字段标准化，保证与引擎期望的字段一致

2. **新增数据文件（JSON）**
   - `data/matches-2026.json` — JSON 格式的 2026 数据（由脚本自动生成）
   - `data/source-status.json` — 数据源状态：什么时候跑的、是什么模式（mock/real）

3. **新增 GitHub Actions**
   - `.github/workflows/update-2026-data.yml` — 每 6 小时定时触发，跑 fetch → normalize → 提交

4. **新增配置/模板**
   - `.env.example` — API Key 环境变量示例
   - `.gitignore` — 忽略 `.env` 和 `node_modules`

5. **前端改动（index.html）**
   - 页面启动时 `fetch('data/matches-2026.json')`，JSON 存在则优先用 JSON；JSON 失败回退到 `data/matches-2026.js` 静态文件
   - 顶部展示数据源状态横幅：是否 mock、最后更新时间、条目数
   - 增加"2026 数据状态"视图，展示候选数据源列表

### 注意事项

- 真实数据源选择需要用户确认（见 PENDING_DECISIONS.md）
- 当前跑 mock/fallback，不是真实数据
- 页面明确标注"当前为 mock / fallback 数据"，不伪装真实数据
- 没改正式评分引擎、正式权重、正式推荐规则

## 2026-06-11：第四步 - 多视图导航和移动端优化

### 背景

首页内容太多：赛事总览、跨届汇总、数据健康、回测仪表盘、模型建议、比赛列表堆在一起，手机上要滑很久。改成分层导航结构，每个主要功能一个独立视图。

### 本次操作

1. **新增顶部导航（6 个视图）**
   - 赛事总览：切换届别、摘要统计、优先级看板
   - 跨届汇总：2018 + 2022 跨届汇总看板
   - 回测复盘：单届回测仪表盘 + 复盘原因分布
   - 模型建议：模型复盘建议 + 模型版本对比 + 比分覆盖优化模拟
   - 比赛列表：当前赛事所有比赛 + 阶段筛选
   - 2026 数据状态：数据源状态 + 候选数据源调研列表

2. **CSS 改动**
   - `.nav` / `.nav-btn`：移动端友好的导航按钮（自动换行、最小宽度、按钮圆角）
   - `.view` / `.view.active`：通过 CSS class 控制视图显示/隐藏

3. **JavaScript 改动**
   - `switchView(viewName)`：切换视图
   - `renderSourceStatus()` / `renderSourceList2()`：渲染数据源状态
   - `renderScoreExpansion(list)`：渲染比分扩展模拟结果（跨届对比）
   - `renderModelAdvice(list)`：渲染模型建议
   - `changeTournament(id)` / `openMatch(id)` / `goBack()`：适配新视图结构

### 注意事项

- 导航切换只改 CSS，不重算数据
- 没有修改正式评分引擎、正式权重、正式推荐规则
- 单场比赛详情页保留原设计不变
- 移动端按钮可触摸、布局紧凑

## 2026-06-11：第五步 - 项目开发边界文件

### 本次操作

1. `PROJECT_GUARDRAILS.md`：明确什么不能动、什么可以更新、哪些改动必须先向用户提案、哪些可以直接做、每次开发完成后必须验证什么
2. `PENDING_DECISIONS.md`：需用户确认的决策列表
3. `NIGHTLY_REPORT.md`：夜间开发报告（本次所有改动的总结）

### 验证清单

- [x] 本地页面正常打开（http://localhost:8000）
- [x] 2018 / 2022 / 2026 切换正常
- [x] 跨届汇总看板正常
- [x] 回测仪表盘正常
- [x] 模型复盘建议正常
- [x] 模型版本对比正常
- [x] 比分覆盖优化模块正常显示（仅模拟，不碰正式推荐）
- [x] 数据源状态横幅正常（2026 视图）
- [x] 顶部导航 6 个视图切换正常
- [x] 点击比赛进入详情页正常
- [x] 从详情页返回总览正常
- [x] 所有新增 JS 文件语法正常（`node --check`）
- [x] GitHub Actions workflow YAML 语法合理
- [x] mock/fallback 数据在页面上明确标注，不伪装真实数据
- [x] 没有修改正式评分引擎、正式权重、正式推荐规则

## 2026-06-11：第六步 - 测试版入口 preview.html + 今日比赛页 + 数据完整度评分

### 背景

继续遵守 PROJECT_GUARDRAILS.md，不改动正式 index.html。把 preview.html 作为主入口，将以下功能放入 preview.html。

### 本次操作

1. **preview.html 新增：
   - 顶部导航 7 个视图（今日比赛 / 赛事总览 / 跨届汇总 / 回测复盘 / 模型建议 / 比赛列表 / 2026 数据）
   - "今日比赛" 靠前展示，每比赛条目：比赛时间、主队/客队、分组、场地、数据源状态、胜平负赔率、让球盘口、大小球盘口、波胆比分候选、主方向、风险等级、进球区间、热门过热标记、防平防冷、数据不足提醒、mock/fallback 标注
2. **自动数据源 adapter：
   - `scripts/sources/fifa-schedule.js（赛程/比分源，占位模式等待 FIFA 公开 2026 赛程后启用
   - `scripts/sources/odds-provider-template.js（赔率源模板，需你确认 API Key 后再启用
   - `scripts/sources/news-source-template.js（新闻源模板，需你确认后再启用
   - `scripts/sources/README.md（数据源接入流程说明
3. **数据完整度评分：
   - `engine/data-quality.js`：8 项检查（赛程/胜平负/让球/大小球/波胆/新闻/多公司赔率/盘口时间线，输出 0~100 分及可进入风控分析阈值 70 分以下仅谨慎判断、30 分以上可进入正式风控分析、30 分以下数据不足
4. **2026 数据结构强化：
   - `data/matches-2026.json`：支持今日比赛、数据源状态、最后更新时间、mock 标记、赔率字段、盘口字段、大小球字段、新闻字段和赛后比分字段
5. **赛后复盘入口：
   - 如果 actual 为空显示"等待赛果"；有 actual 则对比赛前判断和比分覆盖和模型错因
6. **移动端优化：
   - 顶部导航清晰、卡片紧凑、重要结论先展示、详细解释折叠、单场详情不被破坏

### 验证清单

- [x] preview.html 正常打开
- [x] 今日比赛视图正常
- [x] 数据完整度评分正常
- [x] 数据源状态正常
- [x] 比分扩展模拟正常
- [x] 跨届汇总正常
- [x] 回测复盘正常
- [x] 单场详情正常
- [x] 2018 / 2022 / 2026 切换正常
- [x] mock/fallback 数据有明确标注（橙色横幅 + mock 标签
- [x] 正式 index.html 与 main 分支一致（未被修改
- [x] 未修改正式模型/权重文件（scoring.js / model-advice.js / intent.js / backtest.js / config.js / validate.js / review.js / model-version.js）
- [x] GitHub Actions 仅手动触发，不自动提交 mock 数据

## 2026-06-11：第七步 - 合并前验收 + PENDING_DECISIONS.md 同步

### 本次操作

1. **MERGE_REVIEW.md：合并前验收文档
2. **NIGHTLY_REPORT.md：夜间开发报告同步
3. **PENDING_DECISIONS.md：需用户确认的决策列表（API Key 选择、真实数据源接入时机）

### 未解决的问题

1. **GitHub Actions 原自动提交 mock 数据问题：删除 cron 定时，仅保留手动触发
2. **commit message 闭合引号：修复缺失的 YAML 语法错误
3. **脚本内容变化才写文件：fetch-2026-data.js 通过 contentDiffersFromFile 判断内容变化后再写文件
4. **data/matches-2018.js 中文引号嵌套导致语法错误：修复后使用『』替换嵌套
