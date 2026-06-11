# TRAE Code 接手开发说明

## 项目地址

GitHub 仓库：

```text
https://github.com/UIYES/worldcup-odds-risk-control.git
```

当前在线网页：

```text
https://uiyes.github.io/worldcup-odds-risk-control/
```

当前线上入口是单文件版 `index.html`。因为用户目前主要用手机上传 GitHub，不能稳定上传文件夹，所以现阶段把完整页面、数据和引擎都内嵌进了 `index.html`。

## 项目目标

这是一个面向 2026 世界杯的赔率风控分析工具。项目重点不是预测谁一定赢，而是用操盘风控视角判断：

- 哪些比赛值得重点跟踪
- 哪些比赛需要等临场确认
- 哪些热门比赛可能过热
- 哪些盘口存在冷门或防平信号
- 赛后如何复盘模型判断是否合理

长期目标是从离线/静态网页逐步升级为在线数据驱动的分析系统。

## 当前运行方式

### 在线版

用户已经成功开通 GitHub Pages：

```text
https://uiyes.github.io/worldcup-odds-risk-control/
```

现在只要更新仓库里的 `index.html`，在线页面就会更新。

### JSBox 在线版

仓库中有在线入口脚本：

```text
worldcup-jsbox-online.js
```

脚本内容是用 JSBox WebView 打开 GitHub Pages 地址。

### JSBox 离线版

仓库中也保留了离线版：

```text
worldcup-jsbox.js
```

它把完整 HTML 内嵌在 JSBox 脚本里，不依赖网络。

## 当前文件形态

项目已从单文件版恢复为标准目录结构：

```text
index.html                    # 正式入口（通过 script 引用模块）
index-standalone.html        # 单文件备份（GitHub Pages 出问题时回退用）
data/
  tournaments.js
  matches-2018.js
  matches-2022.js
  matches-2026.js
engine/
  config.js
  scoring.js
  backtest.js
  intent.js
  review.js
  model-advice.js
  model-version.js
  cross-tournament.js
  validate.js
docs/
  DEVELOPMENT_LOG.md
  2026_DATA_TEMPLATE.md
  TRAE_CODE_HANDOFF.md
```

现在 `index.html` 通过 `<script src="...">` 引用 `data/` 和 `engine/` 的真实文件。

## 已实现功能

### 页面

- 赛事总览
- 赛事届别切换
- 单场比赛详情
- 概览、评分、波胆、让球、采集五个详情页
- 手机端基础适配
- GitHub Pages 在线访问
- JSBox 离线入口
- JSBox 在线入口

### 数据

当前历史样本：

| 届别 | 样本数 |
|---|---:|
| 2018 世界杯 | 7 场 |
| 2022 世界杯 | 9 场 |
| 2026 世界杯 | 占位，尚无真实赛程 |

2026 数据模板在：

```text
docs/2026_DATA_TEMPLATE.md
data/matches-2026.js
```

### 引擎

已实现的模块：

```text
engine/config.js
engine/scoring.js
engine/backtest.js
engine/intent.js
engine/review.js
engine/model-advice.js
engine/model-version.js
engine/cross-tournament.js
engine/validate.js
```

主要能力：

- 风控评分
- 盘口水位分析
- 波胆热力图
- 盘口意图判断
- 回测统计
- 赛后自动复盘
- 数据完整性检查
- 模型复盘建议
- 模型版本对比
- 跨届汇总

## 近期开发过程

项目是按“每一步先复盘，再继续开发”的方式推进的。

已完成的重要阶段：

1. 建立世界杯赔率风控网页原型
2. 增加 2018、2022、2026 届别切换
3. 拆分评分、意图、回测、复盘等引擎
4. 增加赛后自动复盘
5. 增加数据校验模块
6. 增加 2026 数据模板
7. 扩充 2022 样本到 9 场
8. 扩充 2018 样本到 7 场
9. 增加模型复盘建议
10. 增加模型版本对比
11. 增加跨届汇总看板
12. 生成 JSBox 离线版
13. 改造为 GitHub Pages 单文件在线版
14. 从单文件版恢复标准目录结构（拆分 data/、engine/、docs/，重构 index.html 入口）

## 当前文件形态

## 当前模型观察

跨届汇总看板显示，目前历史总样本为 16 场。

当前暴露出来的主要问题：

- 比分覆盖偏低
- 进球区间判断仍不稳定
- 热门过热信号需要继续验证
- 冷门波胆异动需要更高权重
- 下盘降水信号需要更明确地进入风险判断

现在的模型版本对比只是模拟，不应直接替换正式模型。

## 推荐下一步

### 第一优先级：比分覆盖优化雏形

原因：跨届汇总显示比分覆盖率偏低。

建议新增：

```text
engine/score-expander.js
```

目标：

- 在原候选比分之外补充相邻比分
- 补充冷门波胆
- 补充平局波胆
- 补充大比分和其他比分分组
- 回测扩展前后比分覆盖变化

注意：不要直接替换正式推荐，先作为“比分扩展模拟”展示。

### 第二优先级：进球区间优化

当前进球判断主要依赖粗粒度概率。后续应增加大小球盘口和大小球水位时间线。

建议新增字段：

```js
totals: {
  line: "2.5",
  timeline: [
    { time: "初盘", line: "2.5", overWater: 0.94, underWater: 0.94 },
    { time: "临场", line: "2.75", overWater: 0.86, underWater: 1.02 }
  ]
}
```

### 第三优先级：✅ 已完成 - 恢复标准目录结构

已于 2026-06-11 完成从单文件版到标准目录结构的恢复。

### 第四优先级：在线数据架构

后期 2026 真正开始时，建议把数据从 JS 文件拆为 JSON：

```text
data/matches-2026.json
```

页面启动时读取 JSON，这样后续只更新数据文件即可。

## 给 TRAE Code 的首次提示词

用户可以直接复制下面这段发给 TRAE Code：

```text
这是我的世界杯赔率风控分析项目，GitHub 仓库是：
https://github.com/UIYES/worldcup-odds-risk-control.git

线上页面已经通过 GitHub Pages 跑通：
https://uiyes.github.io/worldcup-odds-risk-control/

当前线上入口是单文件版 index.html，因为我之前主要用手机上传 GitHub，文件夹不方便上传。请先阅读 README.md、DEPLOY.md、TRAE_CODE_BOOTSTRAP.md，以及 docs/ 下的开发记录。

请你接手后先做一次项目体检，不要立刻重写。需要确认：
1. 当前在线页面是否能正常打开
2. index.html 是否为当前线上完整入口
3. 是否需要恢复标准目录结构
4. 2018 和 2022 历史样本是否能正常回测
5. 当前模型复盘建议和跨届汇总看板是否正常

后续开发请延续这个原则：每一步开发前先复盘，不要直接改正式模型。需要先做模拟、回测和对比，再决定是否把新规则纳入正式模型。

下一步建议优先做“比分覆盖优化雏形”：新增比分候选扩展逻辑，先作为模拟结果展示，比较扩展前后比分覆盖率，不要直接替换当前正式推荐。
```

## 开发原则

- 每一步先复盘，再开发
- 不直接改正式模型，先做模拟和回测
- 样本不足时不做强结论
- 优先保证手机和 GitHub Pages 能打开
- 长期目标是服务 2026 世界杯真实数据
- 页面要让普通用户看懂盘口、水位和波胆含义

