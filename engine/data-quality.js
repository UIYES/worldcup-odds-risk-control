// 数据完整度评分模块（data-quality）
//
// 目标：不要在数据不完整时给过强结论。
//
// 检查项（每项 0~1 分，平均后 0~100）：
//   1. 赛程基本信息（id / date / home / away / stage）
//   2. 胜平负赔率（probs.home / draw / away）
//   3. 让球盘口与水位（handicap.line / homeWater / awayWater）
//   4. 大小球盘口与水位（goals[0].total 或 goalsOverUnder）
//   5. 波胆赔率（scoreOdds / scoreProb 非空）
//   6. 阵容/伤停/新闻（news 非空）
//   7. 多公司赔率（handicap.timeline 长度 > 1 或 multiOdds 非空）
//   8. 盘口时间线（handicap.timeline 长度 >= 3）
//
// 输出：
//   score          0~100，数据完整度
//   available      已具备的字段名数组
//   missing        缺失字段名数组
//   canAnalysis    score >= 70 才可进入正式风控分析
//   onlyCautious   30 <= score < 70 只能给谨慎判断
//   needMoreData   score < 30 数据严重不足
//   reason         中文说明为什么当前判断不确定
//   mockFlags      是否是 mock/fallback 数据
//
// 使用（暴露到 window.DataQualityEngine）：
//   const r = window.DataQualityEngine.analyze(match);
//   console.log(r.score, r.missing, r.reason);

(function () {
  "use strict";

  const CHECKLIST = [
    {
      key: "schedule",
      label: "赛程基本信息",
      required: ["id", "date", "home", "away"],
      has: (m) =>
        m &&
        typeof m.id !== "undefined" &&
        typeof m.date === "string" &&
        m.date.length > 0 &&
        typeof m.home === "string" &&
        m.home.length > 0 &&
        typeof m.away === "string" &&
        m.away.length > 0
    },
    {
      key: "odds1x2",
      label: "胜平负赔率",
      required: ["probs.home", "probs.draw", "probs.away"],
      has: (m) =>
        m.probs &&
        typeof m.probs.home === "number" &&
        m.probs.home > 0 &&
        typeof m.probs.draw === "number" &&
        m.probs.draw > 0 &&
        typeof m.probs.away === "number" &&
        m.probs.away > 0
    },
    {
      key: "handicap",
      label: "让球盘口与水位",
      required: ["handicap.line", "handicap.homeWater", "handicap.awayWater"],
      has: (m) =>
        m.handicap &&
        typeof m.handicap.line === "string" &&
        m.handicap.line.length > 0 &&
        (Array.isArray(m.handicap.homeWater) || typeof m.handicap.homeWater === "number") &&
        (Array.isArray(m.handicap.awayWater) || typeof m.handicap.awayWater === "number")
    },
    {
      key: "overUnder",
      label: "大小球盘口与水位",
      required: ["goals"],
      has: (m) =>
        Array.isArray(m.goals) &&
        m.goals.length >= 2 &&
        m.goals.every(g => Array.isArray(g) && typeof g[1] === "number" && g[1] > 0)
    },
    {
      key: "correctScore",
      label: "波胆/比分赔率",
      required: ["scoreOdds", "scoreProb"],
      has: (m) =>
        (m.scoreOdds && typeof m.scoreOdds === "object" && Object.keys(m.scoreOdds).length > 0) ||
        (Array.isArray(m.scoreProb) && m.scoreProb.length > 0)
    },
    {
      key: "news",
      label: "阵容/伤停/新闻",
      required: ["news"],
      has: (m) => Array.isArray(m.news) && m.news.length > 0 && m.news.every(n => typeof n === "string" && n.length > 0)
    },
    {
      key: "multiBookmaker",
      label: "多公司赔率",
      required: ["multiOdds 或 handicap.timeline.length > 1"],
      has: (m) =>
        (m.handicap && Array.isArray(m.handicap.timeline) && m.handicap.timeline.length > 1) ||
        (typeof m.multiOdds === "object" && m.multiOdds !== null && Object.keys(m.multiOdds).length > 0)
    },
    {
      key: "timeline",
      label: "盘口时间线",
      required: ["handicap.timeline.length >= 3"],
      has: (m) =>
        m.handicap && Array.isArray(m.handicap.timeline) && m.handicap.timeline.length >= 3
    }
  ];

  function isMock(match) {
    if (match && match._mock === true) return true;
    if (match && typeof match.home === "string" && (match.home.includes("占位") || match.home.includes("待自动抓取"))) return true;
    if (match && typeof match.predict === "string" && match.predict.includes("等待自动数据")) return true;
    return false;
  }

  function analyze(match) {
    if (!match || typeof match !== "object") {
      return {
        score: 0,
        available: [],
        missing: CHECKLIST.map(c => c.label),
        canAnalysis: false,
        onlyCautious: false,
        needMoreData: true,
        reason: "未提供比赛对象，无法分析。",
        mock: true
      };
    }

    const available = [];
    const missing = [];
    let pass = 0;

    CHECKLIST.forEach(c => {
      if (c.has(match)) {
        available.push(c.label);
        pass++;
      } else {
        missing.push(c.label);
      }
    });

    const score = Math.round((pass / CHECKLIST.length) * 100);
    const mock = isMock(match);
    let reason;

    if (mock) {
      reason = "当前为 mock / fallback 数据；赔率、盘口、水位均为占位值，仅用于验证页面结构；接入真实数据源后会刷新。";
    } else if (score >= 70) {
      reason = `数据完整度 ${score} 分，已具备核心字段，可以进入正式风控分析；${missing.length ? "建议补齐：" + missing.join("、") : "字段完整"}。`;
    } else if (score >= 30) {
      reason = `数据完整度仅 ${score} 分，缺少 ${missing.join("、")}；只能给谨慎判断，建议补齐赔率源/盘口时间线/新闻后再结论。`;
    } else {
      reason = `数据完整度仅 ${score} 分，严重缺少 ${missing.join("、")}；不建议进入正式风控分析。`;
    }

    return {
      score,
      available,
      missing,
      canAnalysis: score >= 70 && !mock,
      onlyCautious: score >= 30 && score < 70,
      needMoreData: score < 30 || mock,
      reason,
      mock
    };
  }

  function summarize(list) {
    if (!Array.isArray(list) || list.length === 0) {
      return { total: 0, avgScore: 0, mockCount: 0, okCount: 0, cautiousCount: 0, insufficientCount: 0, reason: "无比赛可分析。" };
    }
    let totalScore = 0, mockCount = 0, okCount = 0, cautiousCount = 0, insufficientCount = 0;
    list.forEach(m => {
      const r = analyze(m);
      totalScore += r.score;
      if (r.mock) mockCount++;
      if (r.canAnalysis) okCount++;
      else if (r.onlyCautious) cautiousCount++;
      else insufficientCount++;
    });
    return {
      total: list.length,
      avgScore: Math.round(totalScore / list.length),
      mockCount,
      okCount,
      cautiousCount,
      insufficientCount,
      reason: `共 ${list.length} 场，平均完整度 ${Math.round(totalScore / list.length)} 分；${mockCount > 0 ? mockCount + " 场为 mock/fallback 数据；" : ""}${okCount} 场可进入正式风控；${cautiousCount} 场需谨慎判断；${insufficientCount} 场数据不足。`
    };
  }

  window.DataQualityEngine = { analyze, summarize, CHECKLIST };
})();
