// 回测统计引擎
// 目标：把命中率、比分区间、进球区间、冷门预警等计算从页面中拆出来。
// 后期接入 2026 世界杯真实数据时，页面只负责展示，回测引擎负责计算。
(function () {
  function actualOutcome(m) {
    if (!m.actual) return "未结束";
    const [home, away] = m.actual.split(":").map(Number);
    if (home > away) return "主胜";
    if (home < away) return "客胜";
    return "平局";
  }

  function favoriteOutcome(m) {
    if (m.probs.home === m.probs.away) return "平局";
    return m.probs.home > m.probs.away ? "主胜" : "客胜";
  }

  function scoreZoneHit(m, final) {
    if (!m.actual) return false;
    return final.scoreZone.split(" / ").includes(m.actual);
  }

  function goalZoneHit(m, final) {
    if (!m.actual) return false;
    const [home, away] = m.actual.split(":").map(Number);
    const total = home + away;
    if (final.goalZone.includes("0-1")) return total <= 1;
    if (final.goalZone.includes("2-3")) return total >= 2 && total <= 3;
    if (final.goalZone.includes("4")) return total >= 4;
    return false;
  }

  function upsetHappened(m) {
    if (!m.actual) return false;
    const fav = favoriteOutcome(m);
    const actual = actualOutcome(m);
    return fav !== "平局" && actual !== fav;
  }

  function pct(part, total) {
    return total ? Math.round(part / total * 100) + "%" : "暂无";
  }

  function backtestRows(list) {
    return list
      .filter(m => m.actual)
      .map(m => {
        const risk = riskControlScore(m);
        const profile = handicapProfile(m);
        const final = finalPrediction(m);
        return {
          match: m,
          risk,
          profile,
          final,
          directionHit: Boolean(m.resultCorrect),
          scoreHit: scoreZoneHit(m, final),
          goalHit: goalZoneHit(m, final),
          upset: upsetHappened(m),
          warnedUpset: profile.upset > 60
        };
      });
  }

  function backtestStats(list) {
    const rows = backtestRows(list);
    const focusRows = rows.filter(x => x.risk.total >= 72);
    const waitRows = rows.filter(x => x.risk.total >= 55 && x.risk.total < 72);
    const filterRows = rows.filter(x => x.risk.total < 55);
    const warned = rows.filter(x => x.warnedUpset);
    const missRows = rows.filter(x => !x.directionHit || (x.warnedUpset && !x.upset));
    return {
      rows,
      total: rows.length,
      directionRate: pct(rows.filter(x => x.directionHit).length, rows.length),
      scoreRate: pct(rows.filter(x => x.scoreHit).length, rows.length),
      goalRate: pct(rows.filter(x => x.goalHit).length, rows.length),
      focusRate: pct(focusRows.filter(x => x.directionHit).length, focusRows.length),
      waitRate: pct(waitRows.filter(x => x.directionHit).length, waitRows.length),
      filterRate: pct(filterRows.filter(x => x.directionHit).length, filterRows.length),
      upsetWarnRate: pct(warned.filter(x => x.upset).length, warned.length),
      missRows
    };
  }

  const api = {
    actualOutcome,
    favoriteOutcome,
    scoreZoneHit,
    goalZoneHit,
    upsetHappened,
    backtestRows,
    backtestStats
  };

  window.BacktestEngine = api;
  Object.assign(window, api);
})();
