# 交接文档

## 项目状态

项目已完成从单文件版到标准目录结构的恢复。

## 目录结构

```
worldcup-odds-risk-control/
├── index.html                    # 正式入口（通过 script 引用模块）
├── index-standalone.html          # 单文件备份（GitHub Pages 出问题时回退用）
├── data/
│   ├── tournaments.js             # 赛事注册表
│   ├── matches-2018.js            # 2018 世界杯 7 场
│   ├── matches-2022.js            # 2022 世界杯 9 场
│   └── matches-2026.js            # 2026 占位 + 录入模板
├── engine/
│   ├── config.js                  # 风控评分配置
│   ├── scoring.js                 # 评分引擎
│   ├── backtest.js               # 回测引擎
│   ├── intent.js                 # 盘口意图
│   ├── review.js                 # 赛后复盘
│   ├── model-advice.js           # 模型建议
│   ├── model-version.js          # 模型版本对比
│   ├── cross-tournament.js       # 跨届汇总
│   └── validate.js               # 数据校验
└── docs/
    ├── DEVELOPMENT_LOG.md        # 开发记录
    ├── 2026_DATA_TEMPLATE.md    # 2026 数据录入模板
    └── TRAE_CODE_HANDOFF.md     # 本文件
```

## 引擎加载顺序

页面加载时必须按以下顺序执行：

1. `data/tournaments.js`
2. `data/matches-2018.js`
3. `data/matches-2022.js`
4. `data/matches-2026.js`
5. `engine/config.js`
6. `engine/scoring.js`
7. `engine/backtest.js`
8. `engine/intent.js`
9. `engine/review.js`
10. `engine/model-advice.js`
11. `engine/model-version.js`
12. `engine/cross-tournament.js`
13. `engine/validate.js`

## 重要原则

- **不要直接改正式模型**：每次改评分规则后必须用 2018 和 2022 回测验证
- **不要改单文件备份**：index-standalone.html 是应急回退用
- **不要在 TRAE Code 以外的环境混用单文件和目录版**：会导致数据不一致

## 近期开发记录

见 `DEVELOPMENT_LOG.md`

## 当前推荐下一步

1. 验证目录结构后页面正常（赛事总览、跨届汇总、回测仪表盘、模型复盘建议、模型版本对比）
2. 确认后提交 GitHub
3. 后续开发优先做"比分覆盖优化雏形"
