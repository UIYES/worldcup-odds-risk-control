// 2018 俄罗斯世界杯历史回测样本数据（模拟数据）
// 字段结构与 matches-2022.js 完全一致，保证评分引擎不需要改。
window.MATCHES_2018 = [
  {
    id: 101,
    date: "2018-06-27",
    stage: "小组赛",
    home: "韩国",
    away: "德国",
    actual: "2:0",
    finalScore: "2:0",
    predict: "德国胜",
    confidence: 70,
    resultCorrect: false,
    probs: { home: 12, draw: 22, away: 66 },
    goals: [["0-1球", 20], ["2-3球", 55], ["4球以上", 25]],
    scoreOdds: {
      "0:1": [6.6, 6.4, 6.2, 6.0, 5.9],
      "0:2": [6.8, 6.6, 6.3, 6.1, 5.9],
      "1:2": [7.4, 7.2, 6.9, 6.7, 6.5],
      "1:1": [9.0, 8.8, 8.6, 8.4, 8.2],
      "2:0": [22, 21, 19, 17, 14]
    },
    scoreProb: [["0:2", 16], ["0:1", 14], ["1:2", 12], ["1:1", 10], ["2:0", 4]],
    handicap: {
      line: "德国 -1.5",
      timeline: [
        { time: "初盘",  line: "德国 -1.25", homeWater: 0.94, awayWater: 0.94 },
        { time: "T-24h", line: "德国 -1.25", homeWater: 0.92, awayWater: 0.96 },
        { time: "T-6h",  line: "德国 -1.5",  homeWater: 0.86, awayWater: 1.02 },
        { time: "T-1h",  line: "德国 -1.5",  homeWater: 0.82, awayWater: 1.07 },
        { time: "临场",  line: "德国 -1.5",  homeWater: 0.78, awayWater: 1.13 }
      ],
      homeWater: [0.94, 0.92, 0.86, 0.82, 0.78],
      awayWater: [0.94, 0.96, 1.02, 1.07, 1.13],
      signal: "盘口持续升盘，上盘水位深降，市场过度看好德国大胜，是典型的"热门过热"信号。"
    },
    news: ["德国小组赛积分压力大", "韩国体能和拼抢意愿强"]
  },
  {
    id: 102,
    date: "2018-07-01",
    stage: "淘汰赛",
    home: "西班牙",
    away: "俄罗斯",
    actual: "1:1",
    finalScore: "1:1 (点球 3:4，俄罗斯晋级)",
    predict: "西班牙不败",
    confidence: 60,
    resultCorrect: true,
    probs: { home: 58, draw: 27, away: 15 },
    goals: [["0-1球", 32], ["2-3球", 50], ["4球以上", 18]],
    scoreOdds: {
      "1:0": [6.4, 6.3, 6.1, 5.9, 5.8],
      "2:0": [7.2, 7.1, 6.9, 6.7, 6.5],
      "1:1": [7.0, 6.8, 6.6, 6.4, 6.2],
      "2:1": [8.2, 8.0, 7.7, 7.4, 7.1],
      "0:0": [10, 9.6, 9.2, 8.8, 8.4]
    },
    scoreProb: [["1:0", 14], ["2:0", 11], ["1:1", 13], ["2:1", 9], ["0:0", 8]],
    handicap: {
      line: "西班牙 -0.75",
      timeline: [
        { time: "初盘",  line: "西班牙 -1",    homeWater: 0.96, awayWater: 0.92 },
        { time: "T-24h", line: "西班牙 -1",    homeWater: 0.98, awayWater: 0.90 },
        { time: "T-6h",  line: "西班牙 -0.75", homeWater: 0.86, awayWater: 1.02 },
        { time: "T-1h",  line: "西班牙 -0.75", homeWater: 0.84, awayWater: 1.04 },
        { time: "临场",  line: "西班牙 -0.75", homeWater: 0.82, awayWater: 1.06 }
      ],
      homeWater: [0.96, 0.98, 0.86, 0.84, 0.82],
      awayWater: [0.92, 0.90, 1.02, 1.04, 1.06],
      signal: "盘口从 -1 退到 -0.75，是典型的"退盘+上盘降水"，机构对西班牙赢球缺乏信心，平局/小胜风险加大。"
    },
    news: ["西班牙赛前换帅余波未平", "俄罗斯主场气势强但对抗硬度不足"]
  },
  {
    id: 103,
    date: "2018-07-15",
    stage: "决赛",
    home: "法国",
    away: "克罗地亚",
    actual: "4:2",
    finalScore: "4:2",
    predict: "法国胜",
    confidence: 64,
    resultCorrect: true,
    probs: { home: 56, draw: 26, away: 18 },
    goals: [["0-1球", 18], ["2-3球", 50], ["4球以上", 32]],
    scoreOdds: {
      "1:0": [7.2, 7.0, 6.8, 6.6, 6.4],
      "2:1": [7.8, 7.6, 7.3, 7.0, 6.7],
      "2:0": [7.6, 7.4, 7.1, 6.9, 6.7],
      "1:1": [9.0, 8.8, 8.6, 8.4, 8.2],
      "3:1": [12, 11.6, 11.0, 10.4, 9.8]
    },
    scoreProb: [["2:1", 13], ["1:0", 12], ["2:0", 11], ["1:1", 10], ["3:1", 7]],
    handicap: {
      line: "法国 -0.5",
      timeline: [
        { time: "初盘",  line: "法国 -0.5", homeWater: 0.92, awayWater: 0.96 },
        { time: "T-24h", line: "法国 -0.5", homeWater: 0.90, awayWater: 0.98 },
        { time: "T-6h",  line: "法国 -0.5", homeWater: 0.88, awayWater: 1.00 },
        { time: "T-1h",  line: "法国 -0.5", homeWater: 0.86, awayWater: 1.02 },
        { time: "临场",  line: "法国 -0.5", homeWater: 0.84, awayWater: 1.04 }
      ],
      homeWater: [0.92, 0.90, 0.88, 0.86, 0.84],
      awayWater: [0.96, 0.98, 1.00, 1.02, 1.04],
      signal: "盘口稳定不动，上盘水位平稳下降，趋势一致：机构和市场都偏向法国，但优势没有过度放大。"
    },
    news: ["法国阵容齐整", "克罗地亚连续加时体能透支"]
  },
  {
    id: 104,
    date: "2018-06-30",
    stage: "淘汰赛",
    home: "法国",
    away: "阿根廷",
    actual: "4:3",
    finalScore: "4:3",
    predict: "法国不败",
    confidence: 58,
    resultCorrect: true,
    probs: { home: 43, draw: 29, away: 28 },
    goals: [["0-1球", 24], ["2-3球", 51], ["4球以上", 25]],
    scoreOdds: {
      "1:1": [6.6, 6.4, 6.2, 6.0, 5.8],
      "2:1": [8.2, 8.0, 7.6, 7.2, 6.9],
      "1:2": [9.2, 9.0, 8.6, 8.2, 7.8],
      "2:2": [17, 16.2, 15.4, 14.5, 13.6],
      "3:2": [23, 21.5, 19.5, 17.5, 15.5]
    },
    scoreProb: [["1:1", 14], ["2:1", 12], ["1:2", 10], ["2:2", 8], ["3:2", 5]],
    handicap: {
      line: "法国 -0.25",
      timeline: [
        { time: "初盘", line: "法国 -0.25", homeWater: 0.96, awayWater: 0.92 },
        { time: "T-24h", line: "法国 -0.25", homeWater: 0.94, awayWater: 0.94 },
        { time: "T-6h", line: "法国 -0.25", homeWater: 0.91, awayWater: 0.97 },
        { time: "T-1h", line: "法国 -0.25", homeWater: 0.88, awayWater: 1.00 },
        { time: "临场", line: "法国 -0.25", homeWater: 0.85, awayWater: 1.04 }
      ],
      homeWater: [0.96, 0.94, 0.91, 0.88, 0.85],
      awayWater: [0.92, 0.94, 0.97, 1.00, 1.04],
      signal: "浅盘下法国方向持续降水，说明机构更偏向法国不败，但双方进攻爆点多，大比分风险被低估。"
    },
    news: ["法国速度冲击力强", "阿根廷防线转换速度偏慢但前场个人能力强"]
  },
  {
    id: 105,
    date: "2018-07-06",
    stage: "淘汰赛",
    home: "巴西",
    away: "比利时",
    actual: "1:2",
    finalScore: "1:2",
    predict: "巴西胜",
    confidence: 61,
    resultCorrect: false,
    probs: { home: 50, draw: 27, away: 23 },
    goals: [["0-1球", 27], ["2-3球", 52], ["4球以上", 21]],
    scoreOdds: {
      "1:0": [6.4, 6.5, 6.7, 6.9, 7.1],
      "2:1": [8.0, 8.0, 8.1, 8.3, 8.5],
      "1:1": [6.8, 6.6, 6.3, 6.0, 5.7],
      "1:2": [12, 11.2, 10.3, 9.4, 8.5],
      "0:1": [10.5, 10.0, 9.4, 8.8, 8.2]
    },
    scoreProb: [["1:0", 13], ["2:1", 12], ["1:1", 12], ["1:2", 8], ["0:1", 7]],
    handicap: {
      line: "巴西 -0.5",
      timeline: [
        { time: "初盘", line: "巴西 -0.5", homeWater: 0.90, awayWater: 0.98 },
        { time: "T-24h", line: "巴西 -0.5", homeWater: 0.92, awayWater: 0.96 },
        { time: "T-6h", line: "巴西 -0.5", homeWater: 0.96, awayWater: 0.92 },
        { time: "T-1h", line: "巴西 -0.5", homeWater: 0.99, awayWater: 0.89 },
        { time: "临场", line: "巴西 -0.5", homeWater: 1.02, awayWater: 0.86 }
      ],
      homeWater: [0.90, 0.92, 0.96, 0.99, 1.02],
      awayWater: [0.98, 0.96, 0.92, 0.89, 0.86],
      signal: "盘口维持巴西 -0.5，但巴西方向水位持续升高，比利时方向持续降水，是热门方向变得不舒服的典型样本。"
    },
    news: ["巴西个人能力强但边路身后空间大", "比利时反击和前场转换效率高"]
  },
  {
    id: 106,
    date: "2018-07-11",
    stage: "淘汰赛",
    home: "克罗地亚",
    away: "英格兰",
    actual: "1:1",
    finalScore: "1:1 (加时 2:1，克罗地亚晋级)",
    predict: "英格兰不败",
    confidence: 53,
    resultCorrect: true,
    probs: { home: 30, draw: 31, away: 39 },
    goals: [["0-1球", 30], ["2-3球", 52], ["4球以上", 18]],
    scoreOdds: {
      "0:1": [7.8, 7.6, 7.3, 7.0, 6.8],
      "1:1": [6.4, 6.2, 5.9, 5.6, 5.4],
      "1:2": [9.5, 9.1, 8.6, 8.1, 7.8],
      "0:0": [8.8, 8.4, 8.0, 7.7, 7.4],
      "2:1": [11.5, 11.0, 10.2, 9.6, 9.0]
    },
    scoreProb: [["1:1", 15], ["0:1", 11], ["0:0", 9], ["1:2", 9], ["2:1", 8]],
    handicap: {
      line: "英格兰 -0.25",
      timeline: [
        { time: "初盘", line: "英格兰 -0.25", homeWater: 1.00, awayWater: 0.88 },
        { time: "T-24h", line: "英格兰 -0.25", homeWater: 0.98, awayWater: 0.90 },
        { time: "T-6h", line: "英格兰 -0.25", homeWater: 0.96, awayWater: 0.92 },
        { time: "T-1h", line: "英格兰 -0.25", homeWater: 0.94, awayWater: 0.94 },
        { time: "临场", line: "英格兰 -0.25", homeWater: 0.92, awayWater: 0.96 }
      ],
      homeWater: [1.00, 0.98, 0.96, 0.94, 0.92],
      awayWater: [0.88, 0.90, 0.92, 0.94, 0.96],
      signal: "英格兰浅让但水位优势逐步被抹平，淘汰赛半决赛平局和加时风险较高。"
    },
    news: ["克罗地亚中场抗压能力强", "英格兰定位球威胁大但运动战创造力有限"]
  },
  {
    id: 107,
    date: "2018-07-02",
    stage: "淘汰赛",
    home: "巴西",
    away: "墨西哥",
    actual: "2:0",
    finalScore: "2:0",
    predict: "巴西胜",
    confidence: 67,
    resultCorrect: true,
    probs: { home: 62, draw: 24, away: 14 },
    goals: [["0-1球", 24], ["2-3球", 54], ["4球以上", 22]],
    scoreOdds: {
      "1:0": [6.2, 6.0, 5.8, 5.6, 5.4],
      "2:0": [7.2, 6.9, 6.6, 6.2, 5.9],
      "2:1": [8.4, 8.1, 7.8, 7.4, 7.1],
      "1:1": [8.8, 8.7, 8.5, 8.3, 8.1],
      "3:0": [12.5, 12.0, 11.2, 10.5, 9.8]
    },
    scoreProb: [["2:0", 15], ["1:0", 13], ["2:1", 10], ["3:0", 8], ["1:1", 7]],
    handicap: {
      line: "巴西 -1",
      timeline: [
        { time: "初盘", line: "巴西 -0.75", homeWater: 0.94, awayWater: 0.94 },
        { time: "T-24h", line: "巴西 -0.75", homeWater: 0.90, awayWater: 0.98 },
        { time: "T-6h", line: "巴西 -1", homeWater: 0.88, awayWater: 1.00 },
        { time: "T-1h", line: "巴西 -1", homeWater: 0.85, awayWater: 1.04 },
        { time: "临场", line: "巴西 -1", homeWater: 0.82, awayWater: 1.08 }
      ],
      homeWater: [0.94, 0.90, 0.88, 0.85, 0.82],
      awayWater: [0.94, 0.98, 1.00, 1.04, 1.08],
      signal: "盘口从 -0.75 升到 -1，巴西方向持续降水，波胆也集中在小胜和两球胜，是强队优势较清晰的样本。"
    },
    news: ["巴西攻防转换稳定", "墨西哥反击有威胁但终结效率不足"]
  }
];
