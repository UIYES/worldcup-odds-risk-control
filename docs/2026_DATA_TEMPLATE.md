# 2026 世界杯数据录入模板

## 文件位置

`data/matches-2026.js` 中的 `MATCH_2026_TEMPLATE` 对象。

## 录入流程

1. 复制 `MATCH_2026_TEMPLATE` 对象
2. 填入真实数据
3. 将完整对象添加到 `MATCHES_2026` 数组中
4. 无需修改评分引擎，UI 会自动按数据渲染分析

## 字段说明

| 字段 | 类型 | 说明 | 必填 |
|---|---|---|---|
| `id` | 数字 | 比赛唯一标识，建议用 26001 起 | 是 |
| `date` | 字符串 | 比赛日期，格式 YYYY-MM-DD | 是 |
| `stage` | 字符串 | 赛事阶段，如"小组赛"、"1/8决赛"等 | 是 |
| `home` | 字符串 | 主队名称 | 是 |
| `away` | 字符串 | 客队名称 | 是 |
| `actual` | 字符串 | 实际比分，格式如 "2:1" | 赛后填 |
| `finalScore` | 字符串 | 同 actual | 赛后填 |
| `predict` | 字符串 | 赛前方向判断 | 赛前填 |
| `confidence` | 数字 | 信心指数 0-1 | 赛前填 |
| `resultCorrect` | 布尔 | 预测是否正确 | 赛后填 |
| `probs` | 对象 | 胜平负概率 { home, draw, away } | 建议填 |
| `goals` | 数组 | 进球区间 [[名称, 概率]] | 建议填 |
| `scoreOdds` | 对象 | 波胆赔率 { "比分": [赔率列表] } | 建议填 |
| `scoreProb` | 数组 | 波胆概率 [["比分", 概率]] | 建议填 |
| `handicap` | 对象 | 让球盘数据，见下方 | 建议填 |
| `news` | 数组 | 消息列表 | 选填 |

## handicap 字段详解

```js
handicap: {
  line: "主队 -0.25",        // 盘口描述
  timeline: [                 // 时间线（从初盘到临场）
    { time: "初盘", line: "主队 -0.25", homeWater: 0.94, awayWater: 0.94 },
    { time: "T-24h", line: "主队 -0.25", homeWater: 0.94, awayWater: 0.94 },
    { time: "T-6h", line: "主队 -0.25", homeWater: 0.94, awayWater: 0.94 },
    { time: "T-1h", line: "主队 -0.25", homeWater: 0.94, awayWater: 0.94 },
    { time: "临场", line: "主队 -0.25", homeWater: 0.94, awayWater: 0.94 }
  ],
  homeWater: [0.94, 0.94, 0.94, 0.94, 0.94],  // 主队水位时间序列
  awayWater: [0.94, 0.94, 0.94, 0.94, 0.94],  // 客队水位时间序列
  signal: "盘口变化的人工备注"                 // 选填
}
```

## 录入示例

```js
window.MATCHES_2026 = [
  {
    id: 26001,
    date: "2026-06-11",
    stage: "小组赛",
    home: "阿根廷",
    away: "沙特阿拉伯",
    actual: "",
    finalScore: "",
    predict: "主队方向",
    confidence: 0.75,
    resultCorrect: false,
    probs: { home: 0.65, draw: 0.20, away: 0.15 },
    goals: [["0-1球", 0.25], ["2-3球", 0.50], ["4球以上", 0.25]],
    scoreOdds: {
      "1:0": [7.5, 7.5, 7.5, 7.5, 7.5],
      "2:0": [12, 12, 12, 12, 12],
      "2:1": [10, 10, 10, 10, 10],
      "1:1": [12, 12, 12, 12, 12],
      "0:1": [25, 25, 25, 25, 25],
      "0:0": [12, 12, 12, 12, 12]
    },
    scoreProb: [["1:0", 0.18], ["2:0", 0.15], ["2:1", 0.12], ["1:1", 0.10], ["0:0", 0.08]],
    handicap: {
      line: "阿根廷 -1.5",
      timeline: [
        { time: "初盘", line: "阿根廷 -1.5", homeWater: 0.94, awayWater: 0.94 },
        { time: "临场", line: "阿根廷 -1.5", homeWater: 0.88, awayWater: 1.00 }
      ],
      homeWater: [0.94, 0.88],
      awayWater: [0.94, 1.00],
      signal: ""
    },
    news: ["梅西伤愈复出", "沙特门将状态良好"]
  }
];
```
