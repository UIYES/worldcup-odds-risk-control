# 项目记忆 · PROJECT MEMORY

本文件记录当前预览版（`preview.html`）的结构约定，便于后续开发时快速对齐。

## 当前分支

- 开发分支：`trae/three-modules`
- 基准：`main` commit `6867a57`
- 状态：**未合并 main**，所有改动在 `trae/three-modules` 上

## 页面结构（preview.html）

### 1. 顶部区域

- **标题**：世界杯赔率风控分析 · 测试版 (preview)
- **描述**：今日比赛 / 盘口水位 / 波胆分布 / 历史回测
- **测试版标签**：右上角橙色 pill — "测试版 · 数据为 mock/fallback"
  - 这个标签不能去掉，用来明确提醒当前页面仍在测试中

### 2. 三大主导航

| 模块 | 子 tab（内部导航） | 说明 |
|---|---|---|
| **比赛工作台**（默认） | 今日比赛、比赛列表、风险与完整度、赛后复盘 | 日常看比赛、单场分析、赔率盘口摘要、比分候选、进球区间、风险提示、数据完整度、赛后复盘入口 |
| **模型管理台** | 跨届汇总、回测仪表盘、模型建议、比分覆盖优化、模型版本对比 | 跨届汇总看板、历史回测仪表盘、模型建议、正式模型 vs 模拟模型、模型版本对比、模型升级建议 |
| **数据中心** | 数据源状态、数据完整度、待确认决策、接入说明 | A/B/C/D 数据源分级、最后更新时间、mock/fallback 标记、字段缺失、数据完整度评分、PENDING_DECISIONS、API 接入说明 |

### 3. 两级切换逻辑

```
switchModule(moduleName, tabName)   // 切大模块 + 可选 tab
  └─ switchSubTab(moduleName, tabName)  // 切子 tab + 触发对应渲染
     └─ renderOnTabSwitch(moduleName, tabName)  // 渲染对应内容
```

默认进 `比赛工作台 → 今日比赛`（手机端也走同样默认）。

### 4. 新增渲染桥接函数

preview.html 内新增了 9 个桥接渲染函数，全部**只动测试页**，不影响正式 index.html：

| 函数 | 所属模块 | 说明 |
|---|---|---|
| `renderMatchesList()` | 比赛工作台 | 全部比赛列表（带过滤下拉） |
| `renderWorkbenchRisk()` | 比赛工作台 | 风险/完整度/优先级/数据源状态 |
| `renderWorkbenchReview()` | 比赛工作台 | 赛后复盘入口 + 命中统计 |
| `renderModelAdviceDashboard()` | 模型管理台 | 调用正式模型建议逻辑 |
| `renderScoreExpansionDashboard()` | 模型管理台 | 调用比分覆盖优化逻辑 |
| `renderModelVersion()` | 模型管理台 | 基线 vs 增强版本对比 |
| `renderDataSources()` | 数据中心 | 数据源状态 + source-status.json |
| `renderDataQuality()` | 数据中心 | 数据完整度评分（依赖 engine/data-quality.js） |
| `renderPendingDecisions()` | 数据中心 | 待你确认的决策事项列表 |

## mock/fallback 标记约定

- 数据来源来自 `data/source-status.json`，由 bootstrap() 异步加载
- 每条数据都应有 `isMock`、`sourceName`、`sourceTier`（A/B/C/D）、`fetchedAt`
- 页面上明显位置有 mock/fallback 提醒（橙色 pill）
- 严禁在正式 index.html 上替换为 mock 数据

## 数据源可信度分级

```
A 级（官方/权威）：FIFA 官方赛程/比分、官方球队信息、官方比赛状态
B 级（可靠免费 API）：有文档、有稳定接口、有免费额度、允许项目调用、支持 GitHub Actions
C 级（权威媒体/大型体育平台）：公开信息，用于交叉验证阵容/伤停/新闻
D 级（不稳定）：论坛、自媒体、抓取限制不清的网站 → 仅作为人工参考，不自动抓取
```

## 不变的边界（PROJECT_GUARDRAILS.md）

以下文件**绝对不动**，任何改动前必须在 PENDING_DECISIONS.md 登记并等你确认：

| 文件 | 为什么不能动 |
|---|---|
| `index.html` | 正式首页，用户稳定使用中 |
| `engine/scoring.js` | 正式评分引擎，改了会影响所有推荐 |
| `engine/config.js` | 正式权重配置 |
| `engine/intent.js` | 盘口意图分析 |
| `engine/backtest.js` | 历史回测引擎 |
| `data/matches-2018.js` / `data/matches-2022.js` | 历史样本数据 |

测试页 `preview.html` 的桥接函数**调用正式引擎**（如 `finalPrediction`、`riskControlScore`、`handicapProfile`、`crossTournamentStats`），但**只在预览页使用**，不改动引擎本身的逻辑和输出。

## 下一步方向

1. **数据源接入**：`scripts/sources/` 目录有 adapter 模板，等你确认要接哪些源后启用
2. **模型升级建议**：在"模型管理台"里做更细的跨届分析，先在模拟环境跑通再考虑纳入正式
3. **preview.html 是否升级为正式首页**：等你确认后，再考虑替换逻辑（替换前要做完整回归测试）

## 分支清单

| 分支 | 用途 | 状态 |
|---|---|---|
| `main` | 正式发行分支 | 线上可访问 |
| `trae/three-modules` | preview.html 三大模块重构 + bug 修复 | 开发中，**未合并** |
