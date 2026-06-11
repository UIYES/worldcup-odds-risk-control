# scripts/sources/ — 自动数据源 adapter 目录

## 目录说明

本目录存放各个数据源的 adapter 脚本。每个 adapter 负责：

1. 从某个特定源抓取原始数据（或用 mock 占位）
2. 转换成项目标准字段（与 `data/matches-2026.js` 同结构）
3. 写入 `data/matches-2026.json` 或对应的中间 JSON 文件

## 现有文件

| 文件 | 用途 | 状态 |
|---|---|---|
| `fifa-schedule.js` | FIFA 赛程/赛果源 adapter | **占位（等待 FIFA 公开 2026 赛程后启用真实抓取）** |
| `odds-provider-template.js` | 赔率源 adapter 模板（胜平负/让球/大小球/波胆） | **模板（需你确认 API Key 与合规性后再启用）** |
| `news-source-template.js` | 新闻/伤停/首发 源 adapter 模板 | **模板（需你确认后再启用）** |

## 接入新数据源的流程

1. 复制 `odds-provider-template.js` / `news-source-template.js` 为具体源文件
2. 在文件头部记录：来源、是否需要 API Key、Terms of Use / robots.txt 链接
3. 实现真实的 `fetchOdds()` 或 `fetchNews()`
4. 在 `PENDING_DECISIONS.md` 登记新接入决定，等待你确认
5. 只有你确认后，才把该 adapter 连到 `scripts/fetch-2026-data.js`

## 禁止事项（来自 PROJECT_GUARDRAILS.md）

- 不要抓取受版权保护的赔率数据
- 不要绕过登录/付费/限流限制
- 不要把真实 API Key 写进仓库
- 不要在 GitHub Actions 里写自动定时任务（仅手动 workflow_dispatch）

## 下一步

- FIFA 2026 赛程公开后，在 `fifa-schedule.js` 启用真实抓取
- 确认赔率 API Key（The Odds API / API-Football / Sportmonks）后，从模板派生真实 adapter
