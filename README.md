# 世界杯赔率风控分析项目

这是一个面向 2026 世界杯的赔率波动、盘口水位、波胆热区和赛后回测分析原型。项目当前重点不是“猜谁赢”，而是用操盘手风险控制视角判断哪些比赛值得跟踪、哪些比赛要等临场确认、哪些比赛应该过滤。

## 当前状态

项目已经从单文件版恢复为标准目录结构，支持长期维护和开发。

已完成的 16 场历史样本回测（2018 世界杯 7 场 + 2022 世界杯 9 场），支持赛事总览、跨届汇总、回测仪表盘、模型复盘建议、模型版本对比等完整功能。

- 赛事总览页：按届别查看比赛列表
- 届别切换：支持 2018、2022、2026 占位
- 单场详情页：概览、评分、波胆、让球、采集说明
- 风控评分：结合盘口、水位、多家公司一致性、市场热度、冷门风险、波胆热区和进球数
- 波胆热力图：覆盖 0:0 到 5:5，并包含其他主胜、其他平局、其他客胜
- 盘口水位白话解释：让普通用户也能理解盘口和水位代表什么
- 盘口意图判断：判断当前盘口更像真支持、控赔、阻上、诱导、分歧大或暂不明确
- 回测仪表盘：统计方向命中率、比分区间命中、进球区间命中、冷门预警有效性
- 赛后自动复盘：自动分析方向失手、比分未命中、进球区间偏差的可能原因
- 数据检查：检查比赛字段是否完整，方便后期接入 2026 世界杯真实数据
- 2026 数据模板：规定每场比赛该填哪些字段，避免后期录入混乱
- 历史样本扩充：2022 世界杯样本已从 5 场增加到 9 场，用于更稳定地验证规则
- 跨届样本验证：2018 世界杯样本已从 3 场增加到 7 场，用于检查规则是否只适配单届赛事
- 模型复盘建议：根据多场历史样本汇总当前最该调整的规则方向
- 模型版本对比：在不改正式模型的前提下，模拟建议版模型是否更稳
- 跨届汇总看板：合并已结束赛事样本，查看整体表现、跨届高频问题和调优方向

## 如何运行

### 在线访问

如果已开启 GitHub Pages，可以直接打开：

```text
https://uiyes.github.io/worldcup-odds-risk-control/
```

### 本地运行

在项目根目录启动本地服务：

```bash
python3 -m http.server 8000
```

浏览器打开：

```text
http://localhost:8000/worldcup-backtest-prototype.html
```

## 文件结构

项目已恢复为标准目录结构：

```text
worldcup-odds-risk-control/
  index.html                    # 正式入口（通过 script 引用模块）
  index-standalone.html          # 单文件备份（GitHub Pages 出问题时回退用）
  README.md
  DEPLOY.md
  data/
    tournaments.js             # 赛事注册表
    matches-2018.js             # 2018 世界杯 7 场
    matches-2022.js             # 2022 世界杯 9 场
    matches-2026.js             # 2026 占位 + 录入模板
  engine/
    config.js                  # 风控评分配置
    scoring.js                 # 评分引擎
    backtest.js               # 回测引擎
    intent.js                 # 盘口意图
    review.js                 # 赛后复盘
    model-advice.js           # 模型建议
    model-version.js          # 模型版本对比
    cross-tournament.js       # 跨届汇总
    validate.js               # 数据校验
  docs/
    DEVELOPMENT_LOG.md        # 开发记录
    2026_DATA_TEMPLATE.md    # 2026 数据录入模板
    TRAE_CODE_HANDOFF.md     # 交接文档
```

## 核心文件说明

| 文件 | 作用 |
|---|---|
| `index.html` | GitHub Pages 默认入口，会自动打开主页面 |
| `worldcup-backtest-prototype.html` | 当前主页面，包含总览、详情、渲染逻辑和图表 |
| `worldcup-mobile-standalone.html` | 手机/平板可直接打开的单文件离线版 |
| `worldcup-jsbox.js` | JSBox 离线版脚本 |
| `worldcup-jsbox-online.js` | JSBox 在线版入口脚本，打开 GitHub Pages 网页 |
| `DEPLOY.md` | 手机上传 GitHub 和开启 GitHub Pages 的说明 |
| `data/tournaments.js` | 赛事注册表，用来选择 2018、2022、2026 或未来其他赛事 |
| `data/matches-2018.js` | 2018 世界杯回测样本 |
| `data/matches-2022.js` | 2022 世界杯回测样本 |
| `data/matches-2026.js` | 2026 世界杯占位数据 |
| `engine/config.js` | 风控评分权重、阈值、比分范围 |
| `engine/scoring.js` | 风控评分、盘口分析、波胆热区、回测所需计算函数 |
| `engine/backtest.js` | 回测统计引擎，计算命中率、冷门预警有效性和待复盘比赛 |
| `engine/intent.js` | 盘口意图判断，用操盘视角解释盘口变化背后的可能目的 |
| `engine/review.js` | 赛后自动复盘，分析失手原因和下次修正方向 |
| `engine/model-advice.js` | 模型复盘建议，汇总历史样本里的高频问题和调优方向 |
| `engine/model-version.js` | 模型版本对比，模拟当前模型和建议版模型的历史表现 |
| `engine/cross-tournament.js` | 跨届汇总，把已结束赛事样本合并看整体表现和跨届问题 |
| `engine/validate.js` | 数据校验，检查 2026 真实数据是否缺少关键字段 |
| `docs/2026_DATA_TEMPLATE.md` | 2026 世界杯单场比赛数据录入说明 |

## 当前最重要的开发方向

下一阶段应该把项目从“页面原型”升级成“可自我复盘的风控系统”。优先做三件事：

1. 完善 `engine/review.js`，用更多历史比赛验证失误归因是否准确
2. 完善 `engine/intent.js`，用更多历史比赛回测盘口意图判断是否准确
3. 后期接真实数据源，让 2026 世界杯赛程、盘口、水位、波胆自动更新

## 给接手开发者的话

不要急着重写页面。当前原型已经能表达产品思路，下一步重点是拆模块、补数据校验、完善复盘能力。每次改评分规则后，必须用 2018 和 2022 的回测结果验证是否真的变好。
