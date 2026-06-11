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
