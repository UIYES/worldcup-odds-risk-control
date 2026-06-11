// 赛后自动复盘模块
// 目标：比赛结束后，不只判断"对/错"，还要解释可能错在哪里。
// 注意：这是第一版规则归因，后期需要用更多历史比赛回测修正。
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

  function scoreHit(m, final) {
    if (!m.actual) return false;
    return final.scoreZone.split(" / ").includes(m.actual);
  }

  function goalHit(m, final) {
    if (!m.actual) return false;
    const [home, away] = m.actual.split(":").map(Number);
    const total = home + away;
    if (final.goalZone.includes("0-1")) return total <= 1;
    if (final.goalZone.includes("2-3")) return total >= 2 && total <= 3;
    if (final.goalZone.includes("4")) return total >= 4;
    return false;
  }

  function upsetHappened(m) {
    const fav = favoriteOutcome(m);
    const actual = actualOutcome(m);
    return fav !== "平局" && actual !== fav;
  }

  function reason(label, evidence, suggestion, level) {
    return { label, evidence, suggestion, level: level || "中" };
  }

  function reviewMatch(m) {
    const risk = riskControlScore(m);
    const profile = handicapProfile(m);
    const final = finalPrediction(m);
    const intent = getLineIntent(m);
    const heat = scoreHeatSummary(m);
    const lineMove = lineMovementSummary(m);
    const rational = handicapRationality(m);
    const directionHit = Boolean(m.resultCorrect);
    const scoreZoneHit = scoreHit(m, final);
    const goalZoneHit = goalHit(m, final);
    const upset = upsetHappened(m);
    const reasons = [];

    if (!m.actual) {
      return {
        match: m,
        status: "未结束",
        mainReason: "等待赛果",
        conclusion: "比赛还没有结算，暂时不能做赛后复盘。",
        reasons: [],
        rows: []
      };
    }

    if (!directionHit && profile.heat >= 75) {
      reasons.push(reason(
        "热门过热未过滤",
        `市场热度 ${profile.heat}%，实际结果没有按主方向打出。`,
        "下次遇到高热热门时，应降低主方向权重，优先检查盘口是否在控赔或诱导。",
        "高"
      ));
    }

    if (!directionHit && lineMove.movement === "盘口退浅") {
      reasons.push(reason(
        "退盘信号低估",
        `盘口从 ${lineMove.opening} 退到 ${lineMove.closing}，但系统仍给了主方向。`,
        "退盘代表强势方门槛降低，应提高防平、防冷权重。",
        "高"
      ));
    }

    if (!directionHit && profile.signal === "下盘升温") {
      reasons.push(reason(
        "下盘降水未重视",
        "下盘方向升温，说明弱势方或冷门方向有资金和盘口信号支持。",
        "类似比赛应降低热门信心，并检查冷门波胆是否同步降赔。",
        "高"
      ));
    }

    if (!directionHit && (m.probs.draw >= 30 || heat.upsetHint.includes("防平"))) {
      reasons.push(reason(
        "平局风险低估",
        `平局概率 ${m.probs.draw}%，波胆提示：${heat.upsetHint}。`,
        "淘汰赛、浅盘、平局波胆发热时，应把平局放入防守方案。",
        "中"
      ));
    }

    if (!directionHit && heat.upsetHint.includes("冷门")) {
      reasons.push(reason(
        "冷门波胆异动未加权",
        heat.plainText,
        "冷门比分持续变热时，应提高爆冷权重，避免只看强队方向。",
        "中"
      ));
    }

    if (!directionHit && intent.type === "分歧大") {
      reasons.push(reason(
        "多家公司分歧未降权",
        "多家公司盘口方向不够统一，提前判断容易出错。",
        "分歧大时应默认等待临场确认，而不是提前给强结论。",
        "中"
      ));
    }

    if (!goalZoneHit) {
      reasons.push(reason(
        "进球区间判断偏差",
        `系统判断 ${final.goalZone}，实际比分 ${m.actual}。`,
        "需要继续加入大小球盘口、水位和比赛节奏数据。",
        "中"
      ));
    }

    if (!scoreZoneHit) {
      reasons.push(reason(
        "比分区间覆盖不足",
        `候选比分 ${final.scoreZone}，实际比分 ${m.actual}。`,
        "波胆候选不能只看最热比分，应增加相邻比分和冷门比分覆盖。",
        "低"
      ));
    }

    if (!reasons.length) {
      reasons.push(reason(
        "判断基本合理",
        "方向、比分区间或进球区间没有暴露明显问题。",
        "继续观察更多样本，不要因为单场命中就过度提高权重。",
        "低"
      ));
    }

    const main = reasons[0];
    const rows = [
      ["赛前方向", final.direction],
      ["实际结果", `${m.actual}（${actualOutcome(m)}）`],
      ["方向命中", directionHit ? "命中" : "未命中"],
      ["比分区间", scoreZoneHit ? "命中" : "未命中"],
      ["进球区间", goalZoneHit ? "命中" : "未命中"],
      ["盘口意图", `${intent.type}，信心 ${intent.confidence}%`],
      ["主要复盘原因", main.label]
    ];

    return {
      match: m,
      status: directionHit ? "方向命中" : "方向失手",
      directionHit,
      scoreZoneHit,
      goalZoneHit,
      upset,
      mainReason: main.label,
      conclusion: main.suggestion,
      reasons,
      rows,
      risk,
      profile,
      final,
      intent,
      rational
    };
  }

  function reviewTournament(matches) {
    const reviews = matches.filter(m => m.actual).map(reviewMatch);
    const reasonMap = {};
    reviews.forEach(r => {
      const key = r.mainReason;
      if (!reasonMap[key]) reasonMap[key] = { reason: key, count: 0, matches: [] };
      reasonMap[key].count += 1;
      reasonMap[key].matches.push(`${r.match.home} vs ${r.match.away}`);
    });
    const summary = Object.values(reasonMap).sort((a, b) => b.count - a.count);
    return { reviews, summary };
  }

  const api = { reviewMatch, reviewTournament };
  window.ReviewEngine = api;
  Object.assign(window, api);
})();
