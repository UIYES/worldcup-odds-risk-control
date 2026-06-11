# trae/nightly-dev 分支合并评审

**分支**：`trae/nightly-dev` → `main`
**基础提交**：main 55fb4de（最新 main）
**建议**：✅ **可以合并**（但请先看下方风险项）

---

## 一、做了什么

### 新增文件（11 个）

| 文件 | 作用 |
|---|---|
| `scripts/fetch-2026-data.js` | 2026 数据抓取脚本（当前跑 mock，等用户确认后接入真实数据源） |
| `scripts/normalize-2026-data.js` | 抓取数据的字段标准化，保证页面引擎能直接吃 |
| `data/matches-2026.json` | JSON 格式的 2026 数据（当前 1 条 mock 数据，由脚本自动生成） |
| `data/source-status.json` | 数据源状态：抓取时间、模式（mock/real）、数据源清单 |
| `.github/workflows/update-2026-data.yml` | GitHub Actions：手动触发数据更新 |
| `.env.example` | API Key 环境变量模板（不包含真实 key） |
| `.gitignore` | 忽略 `.env` 和 `node_modules` |
| `PENDING_DECISIONS.md` | 需要用户确认的决策清单（4 项） |
| `NIGHTLY_REPORT.md` | 夜间开发报告 |
| `MERGE_REVIEW.md` | 本文件（合并前评审） |

### 修改文件（5 个）

| 文件 | 修改内容 |
|---|---|
| `index.html` | 顶部导航 + 6 个视图；JSON 优先读取 data/matches-2026.json；数据源状态横幅；比分扩展模拟 |
| `engine/score-expander.js` | 新增 `analyzeMatches()` 接口，对外暴露 `ScoreExpander` |
| `data/matches-2018.js` | 修复信号字段嵌套引号中文引号（`"热门过热"` → `『热门过热』`） |
| `docs/DEVELOPMENT_LOG.md` | 追加本次开发记录和验证清单 |
| `.github/workflows/update-2026-data.yml` | 原 PR 第 1 版 → 第 2 版：删除 schedule/cron，修复 commit 引号 bug |

### 删除文件（0 个）

无。

---

## 二、PROJECT_GUARDRAILS.md 合规检查

✅ **没有修改正式评分引擎**（`engine/scoring.js` diff=0 行）
✅ **没有修改正式权重配置**（`engine/config.js` diff=0 行）
✅ **没有修改正式推荐逻辑**（`backtest.js`、`intent.js`、`review.js`、`model-advice.js`、`model-version.js` diff=0 行）
✅ **没有修改核心数据字段结构**（现有 matches-*.js 字段不变；新增的 matches-2026.json 严格遵循同结构）
✅ **没有切换 GitHub Pages 部署方式**（静态 HTML + JS，无后端）
✅ **没有接入真实数据源**（仅做架构和 mock 数据，等用户确认后再开）
✅ **mock 数据在页面上有明确标注**（橙色横幅 + "当前为 mock / fallback 数据"）
✅ **PROJECT_GUARDRAILS.md 与 main 分支完全一致**（diff 为空）
✅ **PENDING_DECISIONS.md 写清楚 4 个待用户确认的决策**

---

## 三、发现的问题与修复

### 问题 1：GitHub Actions workflow 的 commit message 缺少闭合引号（严重）

**表现**：原 workflow 第 54 行 `git commit -m "自动更新: 2026 数据 (${GITHUB_SHA:0:7})` 行尾缺少闭合 `"`。

**影响**：Bash 会把下一行 `git push` 当成 commit message 的继续，导致 commit 成功但 push 不执行，且 commit message 内容怪异。

**已修复**：在本分支中补充闭合 `"`，并把 step 标题改为"有意义变化才提交"。

### 问题 2：GitHub Actions workflow 有 6 小时定时触发（`cron: '0 */6 * * *'`），但当前跑 mock，会每 6 小时产生无意义 commit（中等）

**影响**：每 6 小时在 main 分支自动 commit + push mock 数据，git history 会被无意义提交污染。

**已修复**：删除 `schedule` 块，只保留 `workflow_dispatch`（手动触发）。等接入真实数据源后再考虑启用定时。

### 问题 3：mock 数据每次重写时 timestamp 会变，导致 `git diff` 总是非空（中等）

**影响**：即使内容完全相同，`generatedAt` 也会变 → 每次都产生 commit。

**已修复**：在 `scripts/fetch-2026-data.js` 新增 `withoutTimestamps()` + `contentDiffersFromFile()`：写文件前先比较（忽略时间字段），内容不变就不写。

### 问题 4：data/matches-2018.js 信号字段的中文引号嵌套使 `node --check` 失败（小）

**影响**：该文件本身是 JS，浏览器能解析但 `node --check` 会因为字符串嵌套引号失败。

**已修复**：把 `"热门过热"` 改为 `『热门过热』`，其他赛事行同理。

---

## 四、质量验证结果（本地已执行）

| 检查项 | 结果 |
|---|---|
| `node --check` 所有 .js 文件 | ✅ 通过 |
| JSON 解析 matches-2026.json | ✅ 通过（1 条 mock 数据） |
| JSON 解析 source-status.json | ✅ 通过（mode: mock, sources: 6） |
| workflow YAML 语法与缩进 | ✅ 通过（仅 workflow_dispatch） |
| 页面 HTTP 200 | ✅ 通过 |
| data/* 所有外部文件 200 | ✅ 通过 |
| engine/* 所有外部文件 200 | ✅ 通过 |
| 顶部导航 6 个视图 | ✅ 通过 |
| 2018 / 2022 / 2026 赛事切换 | ✅ 通过 |
| 跨届汇总看板 | ✅ 通过 |
| 回测仪表盘 | ✅ 通过 |
| 模型建议 | ✅ 通过 |
| 比分扩展模拟（仅模拟，不改推荐） | ✅ 通过 |
| 单场详情页（点击比赛 → 返回） | ✅ 通过 |
| 数据源状态横幅（2026 视图橙色标注） | ✅ 通过 |
| mock 数据不误当真实赔率 | ✅ 页面明确标注"当前为 mock / fallback 数据" |

---

## 五、建议合并，但合并后仍需用户确认的事

### 建议合并到 main

理由：
- 都是纯前端和脚本的架构改进，不影响正式评分/推荐逻辑
- 已修复 workflow 引号 bug、mock 数据频繁提交、嵌套引号等 4 个问题
- 本地验证全部通过
- 遵守 PROJECT_GUARDRAILS.md 所有边界

### 合并到 main 后仍需用户确认

见 `PENDING_DECISIONS.md`：

1. **接入哪个真实赔率数据源**（The Odds API / API-Football / Sportmonks / 其他）
2. **是否把比分扩展策略纳入正式模型**（还是仅保留模拟展示）
3. **是否调优风控评分权重**（当前权重是第一版经验规则）
4. **是否引入 AI 辅助**（当前无）

你确认第 1 项后，把 API Key 加到 GitHub Secrets（命名：`WORLDCUP_THE_ODDS_API_KEY` 等），然后手动 trigger Actions workflow，就能开始生产真实数据。

---

## 六、合并命令

```bash
# 如果你在 GitHub 界面操作
#   → Pull request: main ... trae/nightly-dev → squash merge

# 或命令行：
git checkout main
git fetch origin
git merge --squash origin/trae/nightly-dev
git commit -m "自动数据源架构雏形 + 多视图导航 + 比分扩展稳定版"
git push
```
