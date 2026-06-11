// 模型版本对比模块
// 目标：在不改动当前正式模型的前提下，模拟"建议版模型"的回测表现。
// 注意：建议版只是验证思路，不直接替换正式模型。
(function () {
  function pct(part, total) {
    return total ? `${Math.round(part / total * 100)}%` : "暂无";
  }

  function scoreSetFromText(text) {
    return new Set(String(text || "").split(" / ").map(x => x.trim()).filter(Boolean));
  }

  function actualGoalZone(m) {
    if (!m.actual) return "";
    const [home, away] = m.actual.split(":").map(Number);
    const total = home + away;
    if (total <= 1) return "0-1球";
    if (total <= 3) return "2-3球";
    return "4球以上";
  }

  function suggestedScoreZone(m, final) {
    const base = scoreSetFromText(final.scoreZone);
    const heat = scoreHeatSummary(m);
    const market = fullScoreMarket(m);
    heat.hotScores.slice(0, 4).forEach(x => base.add(x.score));
    (m.scoreProb || []).slice(0, 4).forEach(x => base.add(x[0]));
    market
      .filter(x => x.change < -12)
      .slice(0, 4)
      .forEach(x => base.add(x.score));
    return [...base].slice(0, 10);
  }

  function suggestedGoalZones(m, final) {
    const zones = new Set([final.goalZone]);
    const heat = scoreHeatSummary(m);
    const best = [...m.goals].sort((a, b) => b[1] - a[1])[0]?.[0];
    if (best) zones.add(best);
    if (heat.goalBias.includes("大球")) zones.add("4球以上");
    if (heat.goalBias.includes("小球")) zones.add("0-1球");
    if (heat.goalBias.includes("中等")) zones.add("2-3球");
    return [...zones];
  }

  function suggestedRiskAction(m, risk, profile, intent) {
    const final = finalPrediction(m);
    const shouldFilter =
      (profile.heat >= 78 && profile.upset >= 55) ||
      profile.signal === "下盘升温" ||
      intent.type === "诱导" ||
      intent.type === "分歧大";
    const shouldWait =
      shouldFilter ||
      intent.type === "控赔" ||
      (m.stage === "淘汰赛" && m.probs.draw >= 28);

    if (shouldFilter && risk.total < 72) return "建议过滤";
    if (shouldWait) return "等临场确认";
    return final.direction;
  }

  function compareModelVersions(matches) {
    const rows = matches.filter(m => m.actual).map(m => {
      const risk = riskControlScore(m);
      const profile = handicapProfile(m);
      const intent = getLineIntent(m);
      const final = finalPrediction(m);
      const currentDirectionHit = Boolean(m.resultCorrect);
      const currentScoreHit = scoreZoneHit(m, final);
      const currentGoalHit = goalZoneHit(m, final);
      const action = suggestedRiskAction(m, risk, profile, intent);
      const suggestedFilteredMiss = !currentDirectionHit && (action === "建议过滤" || action === "等临场确认");
      const suggestedLostChance = currentDirectionHit && action === "建议过滤";
      const scoreZones = suggestedScoreZone(m, final);
      const goalZones = suggestedGoalZones(m, final);
      const suggestedScoreHit = scoreZones.includes(m.actual);
      const suggestedGoalHit = goalZones.includes(actualGoalZone(m));

      return {
        match: m,
        currentDirectionHit,
        currentScoreHit,
        currentGoalHit,
        action,
        suggestedFilteredMiss,
        suggestedLostChance,
        suggestedEffective: currentDirectionHit || suggestedFilteredMiss,
        suggestedScoreHit,
        suggestedGoalHit,
        reason: suggestedFilteredMiss
          ? "建议版会把这场转为等待/过滤，避免硬追方向。"
          : suggestedLostChance
            ? "建议版过滤了原本命中的比赛，属于机会损失。"
            : "建议版处理与当前模型接近。"
      };
    });

    const total = rows.length;
    const currentDirection = rows.filter(x => x.currentDirectionHit).length;
    const currentScore = rows.filter(x => x.currentScoreHit).length;
    const currentGoal = rows.filter(x => x.currentGoalHit).length;
    const suggestedEffective = rows.filter(x => x.suggestedEffective).length;
    const suggestedScore = rows.filter(x => x.suggestedScoreHit).length;
    const suggestedGoal = rows.filter(x => x.suggestedGoalHit).length;
    const protectedCount = rows.filter(x => x.suggestedFilteredMiss).length;
    const lostChance = rows.filter(x => x.suggestedLostChance).length;

    const summary = [
      ["方向处理", pct(currentDirection, total), pct(suggestedEffective, total), `建议版多保护 ${protectedCount} 场失手，机会损失 ${lostChance} 场`],
      ["比分覆盖", pct(currentScore, total), pct(suggestedScore, total), "建议版扩大候选比分范围"],
      ["进球区间", pct(currentGoal, total), pct(suggestedGoal, total), "建议版结合波胆热区补充进球区间"]
    ];

    let verdict = "建议版只是模拟，还不能替换当前模型。";
    if (suggestedEffective > currentDirection && lostChance <= 1) {
      verdict = "建议版在历史样本里更会保护失手场，可以继续扩大样本验证。";
    } else if (lostChance > protectedCount) {
      verdict = "建议版过滤过度，暂时不建议采用。";
    }

    return {
      total,
      verdict,
      summary,
      rows: rows.map(x => [
        `${x.match.home} vs ${x.match.away}`,
        x.currentDirectionHit ? "命中" : "失手",
        x.action,
        x.suggestedScoreHit ? "覆盖" : "未覆盖",
        x.suggestedGoalHit ? "命中" : "未命中",
        x.reason
      ])
    };
  }

  const api = { compareModelVersions };
  window.ModelVersionEngine = api;
  Object.assign(window, api);
})();
