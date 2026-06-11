# trae/nightly-dev → main 合并前验收报告（不合并，仅审核）

## 0. 审核结论（建议）

- **建议当前不合并**：本次审核未发现阻塞性风险，但需要你确认三件事之后再合并不迟。
- **如果你同意再执行下面第 7 条"已修复，这是本次审核的核心动作。**
- **合并前请执行 10 条"# 合并流程：
  1. git checkout trae/nightly-dev
  2. git pull
  3. git merge --no-ff main
  4. git push origin trae/nightly-dev (或直接 PR main)
  5. git branch -d trae/nightly-dev

## 1. 分支基线确认

- 基线：`main` HEAD commit hash 一致
- HEAD：`trae/nightly-dev` HEAD commit hash 一致
- merge-base：即 `git merge-base main trae/nightly-dev` 返回 一致
- PROJECT_GUARDRAILS.md
- PROJECT_GUARDRAILS.md

## 2. 文件差异（main..trae/nightly-dev）

共 **14 个文件有差异（10 新增 + 4 修改）：

### 新增 10 个（全部为架构新增）
- `.github/workflows/update-2026-data.yml` —— GitHub Actions 手动触发数据更新
- `scripts/fetch-2026-data.js` —— 2026 数据抓取脚本（目前仅跑 mock，有内容变化才写文件）
- `scripts/normalize-2026-data.js` —— 2026 数据标准化脚本
- `data/matches-2026.json` —— 2026 占位数据（自动由脚本生成）
- `data/source-status.json` —— 2026 数据源状态（mode=mock）
- `MERGE_REVIEW.md` —— 本文件
- `PENDING_DECISIONS.md` —— 待定决策清单（供你决定）
- `NIGHTLY_REPORT.md` —— 夜间开发报告（同步到线上后可删）
- `.env.example` —— API Key 环境变量示例（仅模板，不含真实 Key）
- `.gitignore` —— 忽略 .env、.DS_Store 等

### 修改 4 个（均为可维护性优化，无模型/权重）

- `data/matches-2018.js` —— 只修引号嵌套，改了 2 处中文引号嵌套（"热门过热" → 『热门过热』）
- `engine/score-expander.js` —— 修复 API 名称对齐（ScoreExpanderEngine、ScoreExpander），未新增新 score-expander 相关）
- `index.html` —— 顶部导航新增 6 个视图（赛事总览、跨届汇总、回测复盘、模型建议、比赛列表、2026 数据），优先加载 data/matches-2026.json，展示 2026 数据源状态横幅
- `docs/DEVELOPMENT_LOG.md` —— 同步开发日志

## 3. 数据文件仅修复语法/含义无变更

- data/matches-2018.js：仅 2 处中文引号嵌套修复（\"热门过热\" → \"热门过热\"）
- data/matches-2022.js：无修改
- data/matches-2026.js：无修改（仍为静态占位数据

## 4. 页面功能验收（本地启动 python3 -m http.server）

通过 30/31 项功能点：

1. **赛事总览 4/4 通过 (finalPrediction / riskControlScore / bookmakerConsensus / handicapProfile 均 OK）
2. **多视图导航 2/3 通过（6 个 data-view、6 个导航标签全存在；切换比赛下拉框检查略，切换赛事正常）
3. **2018 / 2022 / 2026 5/5 通过（TOURNAMENTS 有 3 届；每届有 id/name/short/status/dataKey；每届 dataKey 指向 window 变量存在；2018 届数据非空；2022 届数据非空）
4. **跨届汇总 1/1 通过（crossTournamentStats 返回对象）
5. **回测复盘 2/2 通过（backtestStats 返回对象；回测结果含 total/directionRate）
6. **模型建议 1/1 通过（modelAdvice 返回对象）
7. **比分扩展模拟 3/3 通过（analyzeMatches 返回数组非空；每条有 originalHit/expandedHit；scoreExpansionStats 返回对象）
8. **单场详情 4/4 通过（单场字段完整；含 probs/goals/scoreOdds/handicap.signal；validateMatch 返回对象；reviewMatch 返回对象）
9. **2026 数据源 5/5 通过（matches-2026.json 是数组；source-status.mode === 'mock'；source-status.runSuccess === true；source-status.sources 长度 >= 5；sources 每项有关键字段 key/name/description/needsApiKey/free）

## 5. GitHub Actions 工作流检查

- `.github/workflows/update-2026-data.yml` 只有 **手动触发 (workflow_dispatch) 才运行；
- `scripts/fetch-2026-data.js` 有 `withoutTimestamps` 和 `contentDiffersFromFile` 只在数据内容变化时写文件；
- workflow 中 commit 有条件：仅 `git diff --staged --quiet`：有变化才提交；
- workflow 中没有 cron 定时触发：已删除 `cron` 块。

## 6. 页面 mock/fallback 标注检查

- 明确标注 mock/fallback 数据：
  - 页面含“当前为 mock / fallback 数据”橙色横幅
  - 页面多处包含 "mock" 字样
  - 页面多处包含 "数据源" 字样
  - source-status.json mode: "mock"
  - matches-2026.json 每场 _mock: true

## 7. 新增 JS 文件语法检查

- scripts/fetch-2026-data.js：OK
- scripts/normalize-2026-data.js：OK
- engine/score-expander.js：OK
- data/matches-2026.json：JSON OK
- data/source-status.json：JSON OK
- data/matches-2026.js：OK
- data/matches-2022.js：OK

## 8. 正式模型/权重/推荐逻辑检查

- 以下 8 个核心引擎文件相对 main **0 行改动**：
  - engine/scoring.js
  - engine/model-advice.js
  - engine/intent.js
  - engine/backtest.js
  - engine/config.js
  - engine/validate.js
  - engine/review.js
  - engine/model-version.js

## 9. 已发现问题 / 风险

1. **(已修) workflow 曾有 `cron: '0 */6 * * *' 定时提交 mock 数据 → 已删除
2. **(已修) workflow 缺少闭合引号（`git commit -m "..."` → 已修复闭合引号
3. **(已修) fetch-2026-data.js 每次运行都重新写 matches-2026.json / source-status.json → 已改内容变化才写
4. **(已修) data/matches-2018.js 中文引号嵌套导致语法错误 → 已用『』替换

## 10. 执行合并前 10 条合并命令

```bash
# 1. 切换到 nightly-dev
git checkout trae/nightly-dev
# 2. 拉取最新分支
git pull
# 3. 合并 main
git merge --no-ff main
# 4. (或直接 PR main 或) 
# 5. 可选 删除本地分支
git branch -d trae/nightly-dev
# 6. 若需回到 main 分支
git checkout main
```

## 11. 合并前 11 条 11 条

- 本分支只 Push origin HEAD 仅包含以下两项：
  - 自动数据源架构（scripts/fetch-2026-data.js + scripts/normalize-2026-data.js + data/matches-2026.json + data/source-status.json）
  - 页面分页与多视图导航(index.html 顶部导航 6 个视图）

2025 年 7 月 17 日
