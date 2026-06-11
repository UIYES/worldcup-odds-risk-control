# 开发记录

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
