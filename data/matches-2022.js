// 2022 卡塔尔世界杯历史回测数据（模拟数据，用于第一版原型）
// 字段说明：
//   actual: 博彩公司结算比分（90 分钟常规时间）
//   finalScore: 最终结果（含加时和点球）
//   probs: 模型胜平负概率（赛前快照）
//   goals: 进球数概率分布
//   scoreOdds: 关键波胆赔率随时间变化（5 个时点）
//   scoreProb: 模型估计的高频比分概率
//   handicap: 让球盘口与上下盘水位
//   handicap.timeline: 盘口随时间变化轨迹，后期接真实数据时重点维护
//   news: 与该场比赛相关的简要消息
window.MATCHES_2022 = [
  {
    id: 1,
    date: "2022-11-22",
    stage: "小组赛",
    home: "阿根廷",
    away: "沙特",
    actual: "1:2",
    finalScore: "1:2",
    predict: "阿根廷胜",
    confidence: 72,
    resultCorrect: false,
    probs: { home: 68, draw: 20, away: 12 },
    goals: [["0-1球", 18], ["2-3球", 57], ["4球以上", 25]],
    scoreOdds: {
      "1:0": [6.9, 6.7, 6.4, 6.2, 6.0],
      "2:0": [6.8, 6.6, 6.2, 6.0, 5.8],
      "2:1": [7.2, 7.0, 6.6, 6.4, 6.1],
      "1:1": [10.5, 10.2, 9.8, 9.4, 9.0],
      "0:1": [23, 21, 19, 17, 15]
    },
    scoreProb: [["2:0", 16], ["2:1", 14], ["1:0", 13], ["1:1", 11], ["0:1", 5]],
    handicap: {
      line: "阿根廷 -1.5",
      timeline: [
        { time: "初盘", line: "阿根廷 -1.25", homeWater: 0.92, awayWater: 0.96 },
        { time: "T-24h", line: "阿根廷 -1.25", homeWater: 0.90, awayWater: 0.98 },
        { time: "T-6h", line: "阿根廷 -1.5", homeWater: 0.87, awayWater: 1.01 },
        { time: "T-1h", line: "阿根廷 -1.5", homeWater: 0.84, awayWater: 1.05 },
        { time: "临场", line: "阿根廷 -1.5", homeWater: 0.80, awayWater: 1.10 }
      ],
      homeWater: [0.92, 0.90, 0.87, 0.84, 0.80],
      awayWater: [0.96, 0.98, 1.01, 1.05, 1.10],
      signal: "上盘水位持续下降，说明市场更愿意压阿根廷赢2球以上；但真实结果爆冷，说明强热门也要看冷门风险。"
    },
    news: ["阿根廷赛前热度过高", "沙特防守反击被模型低估"]
  },
  {
    id: 2,
    date: "2022-11-21",
    stage: "小组赛",
    home: "英格兰",
    away: "伊朗",
    actual: "6:2",
    finalScore: "6:2",
    predict: "英格兰胜",
    confidence: 69,
    resultCorrect: true,
    probs: { home: 64, draw: 23, away: 13 },
    goals: [["0-1球", 22], ["2-3球", 53], ["4球以上", 25]],
    scoreOdds: {
      "1:0": [6.5, 6.3, 6.1, 5.9, 5.8],
      "2:0": [7.4, 7.1, 6.9, 6.6, 6.4],
      "2:1": [8.1, 7.8, 7.5, 7.1, 6.9],
      "3:1": [13, 12.5, 11.8, 10.8, 9.8],
      "1:1": [9.5, 9.4, 9.2, 9.0, 8.9]
    },
    scoreProb: [["2:0", 15], ["2:1", 13], ["1:0", 12], ["3:1", 9], ["1:1", 8]],
    handicap: {
      line: "英格兰 -1",
      timeline: [
        { time: "初盘", line: "英格兰 -0.75", homeWater: 0.98, awayWater: 0.88 },
        { time: "T-24h", line: "英格兰 -1", homeWater: 0.95, awayWater: 0.91 },
        { time: "T-6h", line: "英格兰 -1", homeWater: 0.92, awayWater: 0.94 },
        { time: "T-1h", line: "英格兰 -1", homeWater: 0.88, awayWater: 0.99 },
        { time: "临场", line: "英格兰 -1", homeWater: 0.83, awayWater: 1.06 }
      ],
      homeWater: [0.98, 0.95, 0.92, 0.88, 0.83],
      awayWater: [0.88, 0.91, 0.94, 0.99, 1.06],
      signal: "让球方向和进球方向同时支持英格兰，属于趋势比较一致的比赛。"
    },
    news: ["英格兰锋线状态稳定", "伊朗防线承压明显"]
  },
  {
    id: 3,
    date: "2022-11-23",
    stage: "小组赛",
    home: "德国",
    away: "日本",
    actual: "1:2",
    finalScore: "1:2",
    predict: "德国胜",
    confidence: 63,
    resultCorrect: false,
    probs: { home: 58, draw: 25, away: 17 },
    goals: [["0-1球", 24], ["2-3球", 56], ["4球以上", 20]],
    scoreOdds: {
      "1:0": [6.8, 6.6, 6.4, 6.3, 6.1],
      "2:1": [7.6, 7.4, 7.1, 6.9, 6.7],
      "2:0": [7.2, 7.0, 6.8, 6.7, 6.6],
      "1:1": [8.8, 8.7, 8.5, 8.2, 7.9],
      "1:2": [18, 17, 15.5, 13.5, 11.8]
    },
    scoreProb: [["2:1", 14], ["1:0", 12], ["1:1", 12], ["2:0", 10], ["1:2", 6]],
    handicap: {
      line: "德国 -1",
      timeline: [
        { time: "初盘", line: "德国 -1", homeWater: 0.90, awayWater: 0.98 },
        { time: "T-24h", line: "德国 -1", homeWater: 0.88, awayWater: 1.00 },
        { time: "T-6h", line: "德国 -1.25", homeWater: 0.87, awayWater: 1.02 },
        { time: "T-1h", line: "德国 -1", homeWater: 0.91, awayWater: 0.98 },
        { time: "临场", line: "德国 -1", homeWater: 0.96, awayWater: 0.92 }
      ],
      homeWater: [0.90, 0.88, 0.87, 0.91, 0.96],
      awayWater: [0.98, 1.00, 1.02, 0.98, 0.92],
      signal: "临近开赛上盘水位反而抬高，下盘水位下降，这是热门不稳的信号。"
    },
    news: ["德国控球强但效率不稳", "日本反击速度快"]
  },
  {
    id: 4,
    date: "2022-12-09",
    stage: "淘汰赛",
    home: "荷兰",
    away: "阿根廷",
    actual: "2:2",
    finalScore: "2:2 (点球 3:4，阿根廷晋级)",
    predict: "阿根廷不败",
    confidence: 55,
    resultCorrect: true,
    probs: { home: 30, draw: 31, away: 39 },
    goals: [["0-1球", 31], ["2-3球", 48], ["4球以上", 21]],
    scoreOdds: {
      "0:0": [8.5, 8.2, 7.9, 7.6, 7.4],
      "1:1": [6.1, 5.9, 5.6, 5.4, 5.2],
      "0:1": [8.0, 7.8, 7.6, 7.5, 7.3],
      "1:2": [8.8, 8.5, 8.2, 7.8, 7.5],
      "2:2": [18, 17, 16, 15, 13.5]
    },
    scoreProb: [["1:1", 15], ["0:1", 11], ["1:2", 10], ["0:0", 9], ["2:2", 7]],
    handicap: {
      line: "阿根廷 -0.25",
      timeline: [
        { time: "初盘", line: "阿根廷 -0.25", homeWater: 1.02, awayWater: 0.86 },
        { time: "T-24h", line: "阿根廷 -0.25", homeWater: 1.00, awayWater: 0.88 },
        { time: "T-6h", line: "阿根廷 -0.25", homeWater: 0.98, awayWater: 0.90 },
        { time: "T-1h", line: "阿根廷 -0.25", homeWater: 0.97, awayWater: 0.92 },
        { time: "临场", line: "阿根廷 -0.25", homeWater: 0.95, awayWater: 0.94 }
      ],
      homeWater: [1.02, 1.00, 0.98, 0.97, 0.95],
      awayWater: [0.86, 0.88, 0.90, 0.92, 0.94],
      signal: "浅盘说明双方接近，平局和小比分要重点观察。"
    },
    news: ["淘汰赛心态谨慎", "阿根廷关键球能力更强"]
  },
  {
    id: 5,
    date: "2022-12-18",
    stage: "决赛",
    home: "阿根廷",
    away: "法国",
    actual: "3:3",
    finalScore: "3:3 (点球 4:2，阿根廷夺冠)",
    predict: "阿根廷不败",
    confidence: 52,
    resultCorrect: true,
    probs: { home: 36, draw: 30, away: 34 },
    goals: [["0-1球", 29], ["2-3球", 50], ["4球以上", 21]],
    scoreOdds: {
      "0:0": [9.2, 8.8, 8.4, 8.0, 7.8],
      "1:1": [6.3, 6.0, 5.8, 5.5, 5.2],
      "2:1": [9.2, 8.8, 8.5, 8.0, 7.7],
      "1:2": [9.0, 8.7, 8.3, 7.9, 7.6],
      "2:2": [17, 16, 15.5, 14.5, 13.8]
    },
    scoreProb: [["1:1", 13], ["2:1", 10], ["1:2", 10], ["0:0", 8], ["2:2", 8]],
    handicap: {
      line: "阿根廷 0",
      timeline: [
        { time: "初盘", line: "阿根廷 0", homeWater: 0.94, awayWater: 0.94 },
        { time: "T-24h", line: "阿根廷 0", homeWater: 0.92, awayWater: 0.96 },
        { time: "T-6h", line: "阿根廷 0", homeWater: 0.91, awayWater: 0.97 },
        { time: "T-1h", line: "阿根廷 0", homeWater: 0.90, awayWater: 0.98 },
        { time: "临场", line: "阿根廷 0", homeWater: 0.88, awayWater: 1.00 }
      ],
      homeWater: [0.94, 0.92, 0.91, 0.90, 0.88],
      awayWater: [0.94, 0.96, 0.97, 0.98, 1.00],
      signal: "平手盘说明实力非常接近，重点不是谁一定赢，而是观察平局和加时风险。"
    },
    news: ["双方实力接近", "法国进攻爆点多"]
  },
  {
    id: 6,
    date: "2022-11-23",
    stage: "小组赛",
    home: "西班牙",
    away: "哥斯达黎加",
    actual: "7:0",
    finalScore: "7:0",
    predict: "西班牙胜",
    confidence: 76,
    resultCorrect: true,
    probs: { home: 72, draw: 18, away: 10 },
    goals: [["0-1球", 16], ["2-3球", 52], ["4球以上", 32]],
    scoreOdds: {
      "1:0": [5.8, 5.7, 5.6, 5.4, 5.2],
      "2:0": [6.2, 6.0, 5.8, 5.5, 5.2],
      "3:0": [8.8, 8.4, 7.9, 7.3, 6.8],
      "2:1": [8.5, 8.4, 8.2, 8.0, 7.8],
      "4:0": [15, 14, 13, 11.5, 10.2]
    },
    scoreProb: [["2:0", 16], ["3:0", 12], ["1:0", 11], ["2:1", 9], ["4:0", 6]],
    handicap: {
      line: "西班牙 -1.5",
      timeline: [
        { time: "初盘", line: "西班牙 -1.25", homeWater: 0.92, awayWater: 0.96 },
        { time: "T-24h", line: "西班牙 -1.25", homeWater: 0.88, awayWater: 1.00 },
        { time: "T-6h", line: "西班牙 -1.5", homeWater: 0.86, awayWater: 1.03 },
        { time: "T-1h", line: "西班牙 -1.5", homeWater: 0.83, awayWater: 1.07 },
        { time: "临场", line: "西班牙 -1.5", homeWater: 0.80, awayWater: 1.12 }
      ],
      homeWater: [0.92, 0.88, 0.86, 0.83, 0.80],
      awayWater: [0.96, 1.00, 1.03, 1.07, 1.12],
      signal: "盘口升深且上盘持续降水，热门方向和大胜波胆同步走强，是强队真实压制的样本。"
    },
    news: ["西班牙控球体系成熟", "哥斯达黎加防线速度和出球压力偏大"]
  },
  {
    id: 7,
    date: "2022-11-27",
    stage: "小组赛",
    home: "比利时",
    away: "摩洛哥",
    actual: "0:2",
    finalScore: "0:2",
    predict: "比利时不败",
    confidence: 58,
    resultCorrect: false,
    probs: { home: 48, draw: 30, away: 22 },
    goals: [["0-1球", 30], ["2-3球", 51], ["4球以上", 19]],
    scoreOdds: {
      "1:0": [6.8, 6.9, 7.1, 7.3, 7.5],
      "1:1": [6.6, 6.4, 6.1, 5.8, 5.5],
      "2:1": [8.6, 8.7, 8.8, 9.0, 9.2],
      "0:1": [11, 10.2, 9.4, 8.6, 7.8],
      "0:2": [23, 21, 18.5, 16, 13.8]
    },
    scoreProb: [["1:1", 15], ["1:0", 12], ["0:1", 10], ["2:1", 8], ["0:2", 5]],
    handicap: {
      line: "比利时 -0.25",
      timeline: [
        { time: "初盘", line: "比利时 -0.5", homeWater: 0.94, awayWater: 0.94 },
        { time: "T-24h", line: "比利时 -0.5", homeWater: 0.99, awayWater: 0.89 },
        { time: "T-6h", line: "比利时 -0.25", homeWater: 0.88, awayWater: 1.02 },
        { time: "T-1h", line: "比利时 -0.25", homeWater: 0.92, awayWater: 0.98 },
        { time: "临场", line: "比利时 -0.25", homeWater: 0.98, awayWater: 0.92 }
      ],
      homeWater: [0.94, 0.99, 0.88, 0.92, 0.98],
      awayWater: [0.94, 0.89, 1.02, 0.98, 0.92],
      signal: "盘口从 -0.5 退到 -0.25，临场比利时方向升水，摩洛哥方向水位下降，是热门不稳和下盘升温的样本。"
    },
    news: ["比利时阵容老化和节奏偏慢", "摩洛哥防守组织和反击质量较高"]
  },
  {
    id: 8,
    date: "2022-12-09",
    stage: "淘汰赛",
    home: "克罗地亚",
    away: "巴西",
    actual: "1:1",
    finalScore: "1:1 (点球 4:2，克罗地亚晋级)",
    predict: "巴西胜",
    confidence: 66,
    resultCorrect: false,
    probs: { home: 18, draw: 28, away: 54 },
    goals: [["0-1球", 28], ["2-3球", 52], ["4球以上", 20]],
    scoreOdds: {
      "0:1": [6.8, 6.6, 6.4, 6.2, 6.0],
      "0:2": [7.6, 7.4, 7.2, 7.0, 6.8],
      "1:1": [7.4, 7.1, 6.7, 6.2, 5.8],
      "1:2": [8.4, 8.2, 7.9, 7.5, 7.2],
      "0:0": [10, 9.6, 9.2, 8.8, 8.4]
    },
    scoreProb: [["0:1", 14], ["1:1", 13], ["0:2", 11], ["1:2", 9], ["0:0", 8]],
    handicap: {
      line: "巴西 -1",
      timeline: [
        { time: "初盘", line: "巴西 -1", homeWater: 0.96, awayWater: 0.92 },
        { time: "T-24h", line: "巴西 -1", homeWater: 0.98, awayWater: 0.90 },
        { time: "T-6h", line: "巴西 -1", homeWater: 1.00, awayWater: 0.88 },
        { time: "T-1h", line: "巴西 -1", homeWater: 1.02, awayWater: 0.86 },
        { time: "临场", line: "巴西 -1", homeWater: 1.04, awayWater: 0.84 }
      ],
      homeWater: [0.96, 0.98, 1.00, 1.02, 1.04],
      awayWater: [0.92, 0.90, 0.88, 0.86, 0.84],
      signal: "盘口维持巴西 -1，但巴西方向水位压力不够顺，下盘持续降水，淘汰赛平局风险被放大。"
    },
    news: ["克罗地亚中场控制和加时经验强", "巴西个人能力强但淘汰赛容错率低"]
  },
  {
    id: 9,
    date: "2022-12-06",
    stage: "淘汰赛",
    home: "葡萄牙",
    away: "瑞士",
    actual: "6:1",
    finalScore: "6:1",
    predict: "葡萄牙胜",
    confidence: 62,
    resultCorrect: true,
    probs: { home: 52, draw: 27, away: 21 },
    goals: [["0-1球", 26], ["2-3球", 50], ["4球以上", 24]],
    scoreOdds: {
      "1:0": [6.6, 6.5, 6.3, 6.1, 5.9],
      "2:0": [8.0, 7.8, 7.5, 7.1, 6.7],
      "2:1": [8.2, 8.0, 7.7, 7.3, 7.0],
      "3:1": [14, 13.2, 12.2, 11.0, 9.8],
      "1:1": [7.2, 7.0, 6.8, 6.6, 6.4]
    },
    scoreProb: [["2:1", 13], ["1:0", 12], ["2:0", 10], ["1:1", 10], ["3:1", 7]],
    handicap: {
      line: "葡萄牙 -0.5",
      timeline: [
        { time: "初盘", line: "葡萄牙 -0.25", homeWater: 0.94, awayWater: 0.94 },
        { time: "T-24h", line: "葡萄牙 -0.25", homeWater: 0.90, awayWater: 0.98 },
        { time: "T-6h", line: "葡萄牙 -0.5", homeWater: 0.88, awayWater: 1.00 },
        { time: "T-1h", line: "葡萄牙 -0.5", homeWater: 0.84, awayWater: 1.05 },
        { time: "临场", line: "葡萄牙 -0.5", homeWater: 0.80, awayWater: 1.10 }
      ],
      homeWater: [0.94, 0.90, 0.88, 0.84, 0.80],
      awayWater: [0.94, 0.98, 1.00, 1.05, 1.10],
      signal: "盘口从 -0.25 升到 -0.5，葡萄牙方向持续降水，临场攻击端变化后大胜信号增强。"
    },
    news: ["葡萄牙首发调整释放进攻速度", "瑞士防线被高强度冲击打穿"]
  }
];
