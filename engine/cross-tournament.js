// 跨届汇总引擎
// 目标：把 2018、2022 等已结束赛事放在一起验证，判断模型问题是否跨届存在。
(function () {
  function historicalTournamentMatches(tournaments) {
    return tournaments
      .filter(t => t.status === "已结束")
      .map(t => ({
        tournament: t,
        matches: (window[t.dataKey] || []).map(m => ({ ...m, tournamentId: t.id, tournamentName: t.short }))
      }))
      .filter(x => x.matches.length);
  }

  function crossTournamentStats(tournaments) {
    const groups = historicalTournamentMatches(tournaments);
    const allMatches = groups.flatMap(x => x.matches);
    const aggregate = backtestStats(allMatches);
    const advice = modelAdvice(allMatches);
    const version = compareModelVersions(allMatches);
    const review = reviewTournament(allMatches);

    const tournamentRows = groups.map(group => {
      const stats = backtestStats(group.matches);
      return [
        group.tournament.short,
        `${stats.total} 场`,
        stats.directionRate,
        stats.scoreRate,
        stats.goalRate,
        stats.upsetWarnRate
      ];
    });

    const recurringRows = review.summary.slice(0, 5).map(x => [
      x.reason,
      `${x.count} 次`,
      x.matches.slice(0, 4).join(" / ")
    ]);

    const adviceRows = advice.suggestions.slice(0, 5).map(x => [
      x.reason,
      `${x.count} 次`,
      x.urgency,
      x.target
    ]);

    const overviewRows = [
      ["历史总样本", `${aggregate.total} 场`],
      ["整体方向命中", aggregate.directionRate],
      ["整体比分覆盖", aggregate.scoreRate],
      ["整体进球命中", aggregate.goalRate],
      ["冷门预警有效", aggregate.upsetWarnRate]
    ];

    let conclusion = "历史样本还在扩充中，跨届结论暂时只作为观察。";
    if (aggregate.total >= 12 && advice.suggestions.length) {
      conclusion = `跨届样本显示，"${advice.suggestions[0].reason}"是当前最需要继续验证的问题。`;
    }
    if (version.verdict.includes("继续扩大样本验证")) {
      conclusion += " 建议版模型有保护失手场的迹象，但仍不能直接替换正式模型。";
    }

    return {
      total: aggregate.total,
      conclusion,
      overviewRows,
      tournamentRows,
      recurringRows,
      adviceRows,
      versionRows: version.summary
    };
  }

  const api = { historicalTournamentMatches, crossTournamentStats };
  window.CrossTournamentEngine = api;
  Object.assign(window, api);
})();
