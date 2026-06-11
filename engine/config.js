// 风控评分配置
// 后期如果要调评分权重、阈值、波胆范围，优先改这个文件，不要直接改页面。
window.SCORING_CONFIG = {
  scoreRange: {
    maxCorrectScore: 5
  },
  riskThresholds: {
    focus: 72,
    wait: 55
  },
  weights: {
    handicapChange: 22,
    waterDirection: 18,
    bookmakerConsensus: 18,
    marketHeat: 14,
    upsetControl: 14,
    scoreOddsFit: 9,
    goalsFit: 5
  },
  labels: {
    focus: "可重点跟踪",
    wait: "等临场确认",
    filter: "建议过滤",
    lowRisk: "风险可控",
    midRisk: "谨慎观察",
    highRisk: "高风险"
  }
};
