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
