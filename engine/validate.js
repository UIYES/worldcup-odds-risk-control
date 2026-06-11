// 数据校验模块
// 目标：后期接入 2026 世界杯真实数据时，先检查字段是否完整，避免页面崩溃。
(function () {
  function hasValue(value) {
    return value !== undefined && value !== null && value !== "";
  }

  function addIssue(issues, level, field, message) {
    issues.push({ level, field, message });
  }

  function validateMatch(m) {
    const issues = [];
    ["id", "date", "stage", "home", "away"].forEach(field => {
      if (!hasValue(m[field])) addIssue(issues, "错误", field, `缺少 ${field}`);
    });

    if (!m.probs) {
      addIssue(issues, "错误", "probs", "缺少胜平负概率");
    } else {
      ["home", "draw", "away"].forEach(field => {
        if (typeof m.probs[field] !== "number") addIssue(issues, "错误", `probs.${field}`, `缺少 ${field} 概率`);
      });
      const total = (m.probs.home || 0) + (m.probs.draw || 0) + (m.probs.away || 0);
      if (Math.abs(total - 100) > 5) addIssue(issues, "提醒", "probs", `胜平负概率合计为 ${total}，建议接近 100`);
    }

    if (!Array.isArray(m.goals) || !m.goals.length) {
      addIssue(issues, "错误", "goals", "缺少进球数概率");
    }

    if (!m.scoreOdds || !Object.keys(m.scoreOdds).length) {
      addIssue(issues, "提醒", "scoreOdds", "缺少波胆赔率，波胆热力图会不完整");
    }

    if (!Array.isArray(m.scoreProb) || !m.scoreProb.length) {
      addIssue(issues, "提醒", "scoreProb", "缺少候选比分概率");
    }

    if (!m.handicap) {
      addIssue(issues, "错误", "handicap", "缺少让球盘口数据");
    } else {
      if (!Array.isArray(m.handicap.timeline) || m.handicap.timeline.length < 2) {
        addIssue(issues, "错误", "handicap.timeline", "盘口时间线至少需要初盘和临场两条数据");
      }
      if (!hasValue(m.handicap.signal)) {
        addIssue(issues, "提醒", "handicap.signal", "缺少盘口文字信号说明");
      }
    }

    if (m.actual && !m.finalScore) {
      addIssue(issues, "提醒", "finalScore", "已结束比赛建议填写最终结果");
    }

    const errorCount = issues.filter(x => x.level === "错误").length;
    const warnCount = issues.filter(x => x.level === "提醒").length;
    return {
      match: m,
      ok: errorCount === 0,
      errorCount,
      warnCount,
      issues
    };
  }

  function validateTournament(matches) {
    const results = matches.map(validateMatch);
    const errorMatches = results.filter(x => x.errorCount > 0);
    const warnMatches = results.filter(x => x.warnCount > 0);
    const totalErrors = results.reduce((sum, x) => sum + x.errorCount, 0);
    const totalWarnings = results.reduce((sum, x) => sum + x.warnCount, 0);
    return {
      total: matches.length,
      ok: totalErrors === 0,
      totalErrors,
      totalWarnings,
      errorMatches,
      warnMatches,
      results
    };
  }

  const api = { validateMatch, validateTournament };
  window.ValidateEngine = api;
  Object.assign(window, api);
})();
