// 2026 美加墨世界杯数据占位
// 抽签和盘口数据出来后，按 matches-2022.js 的字段结构填充即可。
// 评分引擎无需改动，UI 会自动按这个数据渲染分析。
window.MATCHES_2026 = [];

// 2026 单场比赛录入模板
// 后期新增比赛时，复制下面这个对象，填入 MATCHES_2026 数组即可。
// 注意：actual 和 finalScore 是赛后字段，赛前可以先留空。
window.MATCH_2026_TEMPLATE = {
  id: 26001,
  date: "2026-06-11",
  stage: "小组赛",
  home: "主队名称",
  away: "客队名称",
  actual: "",
  finalScore: "",
  predict: "赛前方向，例如 主队不败 / 客队方向 / 等临场确认",
  confidence: 0,
  resultCorrect: false,
  probs: { home: 0, draw: 0, away: 0 },
  goals: [["0-1球", 0], ["2-3球", 0], ["4球以上", 0]],
  scoreOdds: {
    "0:0": [0, 0, 0, 0, 0],
    "1:0": [0, 0, 0, 0, 0],
    "1:1": [0, 0, 0, 0, 0],
    "2:1": [0, 0, 0, 0, 0],
    "0:1": [0, 0, 0, 0, 0]
  },
  scoreProb: [["1:0", 0], ["1:1", 0], ["2:1", 0], ["0:1", 0], ["0:0", 0]],
  handicap: {
    line: "主队 -0.25",
    timeline: [
      { time: "初盘", line: "主队 -0.25", homeWater: 0.94, awayWater: 0.94 },
      { time: "T-24h", line: "主队 -0.25", homeWater: 0.94, awayWater: 0.94 },
      { time: "T-6h", line: "主队 -0.25", homeWater: 0.94, awayWater: 0.94 },
      { time: "T-1h", line: "主队 -0.25", homeWater: 0.94, awayWater: 0.94 },
      { time: "临场", line: "主队 -0.25", homeWater: 0.94, awayWater: 0.94 }
    ],
    homeWater: [0.94, 0.94, 0.94, 0.94, 0.94],
    awayWater: [0.94, 0.94, 0.94, 0.94, 0.94],
    signal: "填写盘口变化的人工备注，例如：主队降水但未升盘，暂时偏谨慎。"
  },
  news: ["伤停/首发/天气/赛程消息"]
};
