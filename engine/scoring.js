// 世界杯风控评分引擎
// 目标：把操盘风控、盘口合理性、多家公司一致性、波胆热区、临场确认等计算逻辑从页面中拆出来。
(function () {
  const CONFIG = window.SCORING_CONFIG || {
    scoreRange: { maxCorrectScore: 5 },
    riskThresholds: { focus: 72, wait: 55 },
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

  function bestGoal(match) {
    return [...match.goals].sort((a, b) => b[1] - a[1])[0];
  }

  function last(arr) {
    return arr[arr.length - 1];
  }

  function fullScoreMarket(m) {
    const result = [];
    const maxScore = CONFIG.scoreRange.maxCorrectScore;
    for (let h = 0; h <= maxScore; h++) {
      for (let a = 0; a <= maxScore; a++) {
        const score = `${h}:${a}`;
        const base = m.scoreOdds[score] || estimateScoreOdds(m, h, a);
        const first = base[0];
        const lastValue = base[base.length - 1];
        result.push({
          score,
          home: h,
          away: a,
          values: base,
          last: lastValue,
          change: ((lastValue - first) / first) * 100,
          type: h > a ? "主胜" : h === a ? "平局" : "客胜"
        });
      }
    }

    [
      { score: "其他主胜", values: [31, 29, 27, 25, 23], type: "主胜" },
      { score: "其他平局", values: [41, 39, 37, 35, 33], type: "平局" },
      { score: "其他客胜", values: [36, 34, 31, 29, 26], type: "客胜" }
    ].forEach(x => result.push({
      ...x,
      home: maxScore + 1,
      away: maxScore + 1,
      last: x.values[x.values.length - 1],
      change: ((x.values[x.values.length - 1] - x.values[0]) / x.values[0]) * 100
    }));
    return result;
  }

  function handicapTimeline(m) {
    if (m.handicap.timeline?.length) return m.handicap.timeline;
    return m.handicap.homeWater.map((homeWater, index) => ({
      time: ["初盘", "T-24h", "T-6h", "T-1h", "临场"][index] || `T${index}`,
      line: m.handicap.line,
      homeWater,
      awayWater: m.handicap.awayWater[index]
    }));
  }

  function parseHandicapValue(line) {
    const match = line.match(/(-?\d+(?:\.\d+)?)/);
    return match ? Number(match[1]) : 0;
  }

  function lineMovementSummary(m) {
    const timeline = handicapTimeline(m);
    const first = timeline[0];
    const lastItem = timeline[timeline.length - 1];
    const firstValue = parseHandicapValue(first.line);
    const lastValue = parseHandicapValue(lastItem.line);
    const movementValue = Number((lastValue - firstValue).toFixed(2));
    let movement = "盘口平稳";
    let meaning = "盘口没有明显升降，重点看水位和波胆是否配合。";
    if (movementValue < 0) {
      movement = "盘口升深";
      meaning = "让球门槛变高，通常代表强势方阻力变大，也可能是真支持。";
    } else if (movementValue > 0) {
      movement = "盘口退浅";
      meaning = "让球门槛变低，通常代表强势方信心下降或市场出现反向压力。";
    }
    return {
      opening: first.line,
      closing: lastItem.line,
      movement,
      movementValue,
      meaning
    };
  }

  function estimateScoreOdds(m, h, a) {
    const total = h + a;
    const diff = h - a;
    const favHome = m.probs.home >= m.probs.away;
    let start = 7 + total * 2.7 + Math.abs(diff) * 1.5;
    if ((favHome && diff > 0) || (!favHome && diff < 0)) start -= 1.8;
    if ((favHome && diff < 0) || (!favHome && diff > 0)) start += 5.5;
    if (total >= 5) start += 7;
    if (h === a) start += total <= 2 ? -0.8 : 4;
    start = Math.max(5.2, Number(start.toFixed(1)));
    const focus = m.scoreProb.find(x => x[0] === `${h}:${a}`);
    const drop = focus ? .18 : ((diff < 0 && m.confidence > 60) ? .10 : .06);
    return [0, 1, 2, 3, 4].map(i => Number((start * (1 - drop * i / 4)).toFixed(1)));
  }

  function handicapProfile(m) {
    const timeline = handicapTimeline(m);
    const h = timeline.map(x => x.homeWater);
    const a = timeline.map(x => x.awayWater);
    const hMove = last(h) - h[0];
    const aMove = last(a) - a[0];
    const heat = Math.min(95, Math.round(52 + Math.abs(hMove - aMove) * 180 + (m.confidence - 50) * .7));
    const upset = Math.max(5, Math.min(90, Math.round((m.confidence > 65 ? 36 : 24) + (hMove > 0 ? 28 : 0) + (aMove < 0 ? 25 : 0) + (m.resultCorrect ? -8 : 18))));
    const signal = hMove < 0 && aMove > 0 ? "上盘受热" : hMove > 0 && aMove < 0 ? "下盘升温" : "分歧不大";
    const depth = last(timeline).line.includes("-1.5") ? "盘口较深" : last(timeline).line.includes("-1") ? "中深盘口" : "浅盘或平手";
    const waterDirection = signal === "上盘受热" ? "水位支持强队方向" : signal === "下盘升温" ? "水位对热门不友好" : "水位暂时平稳";
    const heatRisk = heat > 75 ? "热度偏高，要防热门过热" : heat > 60 ? "热度中等，需要继续观察" : "热度不算极端";
    const upsetText = upset > 60 ? "爆冷信号明显" : upset > 40 ? "有一定爆冷空间" : "爆冷信号较弱";
    return { heat, upset, signal, depth, waterDirection, heatRisk, upsetText };
  }

  function handicapRationality(m) {
    const profile = handicapProfile(m);
    const market = fullScoreMarket(m);
    const hotScores = [...market].sort((a, b) => a.change - b.change).slice(0, 6);
    const favHome = m.probs.home >= m.probs.away;
    const favType = favHome ? "主胜" : "客胜";
    const favHot = hotScores.filter(x => x.type === favType).length;
    const drawHot = hotScores.filter(x => x.type === "平局").length;
    const coldHot = hotScores.filter(x => x.type !== favType && x.type !== "平局").length;
    let score = 55;

    if (profile.signal === "上盘受热" && favHot >= 2) score += 18;
    if (profile.signal === "下盘升温") score -= 16;
    if (profile.heat > 78) score -= 8;
    if (profile.upset > 60) score -= 15;
    if (drawHot >= 2) score -= 6;
    if (coldHot >= 2) score -= 10;
    if (profile.depth === "盘口较深" && m.confidence >= 65) score += 8;
    if (profile.depth === "浅盘或平手" && Math.abs(m.probs.home - m.probs.away) <= 8) score += 8;

    score = Math.max(10, Math.min(95, Math.round(score)));
    const level = score >= 75 ? "盘口较合理" : score >= 55 ? "需要观察" : "风险偏高";
    const reasons = [
      ["水位方向", profile.waterDirection],
      ["热度判断", profile.heatRisk],
      ["爆冷判断", profile.upsetText],
      ["波胆核对", favHot >= 2 ? "热门方向波胆有配合" : coldHot >= 2 ? "冷门波胆有异动" : "波胆分布较分散"]
    ];
    return { score, level, reasons };
  }

  function scoreHeatSummary(m) {
    const market = fullScoreMarket(m);
    const hot = [...market].sort((a, b) => a.change - b.change).slice(0, 10);
    const byType = {
      主胜: hot.filter(x => x.type === "主胜"),
      平局: hot.filter(x => x.type === "平局"),
      客胜: hot.filter(x => x.type === "客胜")
    };
    const lowGoal = hot.filter(x => x.home + x.away <= 2);
    const midGoal = hot.filter(x => x.home + x.away >= 3 && x.home + x.away <= 4);
    const highGoal = hot.filter(x => x.home + x.away >= 5);
    const topType = Object.entries(byType).sort((a, b) => b[1].length - a[1].length)[0][0];
    const goalBias = highGoal.length >= 3 ? "大球热度更高" : lowGoal.length >= 3 ? "小球热度更高" : midGoal.length >= 3 ? "中等进球热度更高" : "进球数信号分散";
    const upsetHint = byType.客胜.length >= 3 || (m.probs.home > m.probs.away && byType.客胜.length >= 2)
      ? "冷门比分有热度，需要防爆冷"
      : byType.平局.length >= 3
        ? "平局比分有热度，需要防平"
        : "冷门信号暂时不强";
    const plainText = `当前波胆热区更偏${topType}，${goalBias}，${upsetHint}。`;
    const groups = [
      ["主胜热区", byType.主胜.slice(0, 3).map(x => `${x.score}(${x.change.toFixed(1)}%)`).join(" / ") || "不明显"],
      ["平局热区", byType.平局.slice(0, 3).map(x => `${x.score}(${x.change.toFixed(1)}%)`).join(" / ") || "不明显"],
      ["客胜热区", byType.客胜.slice(0, 3).map(x => `${x.score}(${x.change.toFixed(1)}%)`).join(" / ") || "不明显"],
      ["进球倾向", goalBias]
    ];
    return {
      topType,
      goalBias,
      upsetHint,
      plainText,
      groups,
      hotScores: hot.slice(0, 6)
    };
  }

  function handicapPlainExplanation(m) {
    const profile = handicapProfile(m);
    const lineMove = lineMovementSummary(m);
    const timeline = handicapTimeline(m);
    const first = timeline[0];
    const lastItem = timeline[timeline.length - 1];
    const homeWaterMove = Number((lastItem.homeWater - first.homeWater).toFixed(2));
    const awayWaterMove = Number((lastItem.awayWater - first.awayWater).toFixed(2));
    let waterText = "上下盘水位变化不大，市场态度暂时不算极端。";
    if (homeWaterMove < -0.05 && awayWaterMove > 0.05) {
      waterText = "上盘水位下降、下盘水位上升，说明市场更愿意接受强势方方向，但也要防热门过热。";
    } else if (homeWaterMove > 0.05 && awayWaterMove < -0.05) {
      waterText = "上盘水位上升、下盘水位下降，说明强势方开始变得不舒服，弱势方或冷门方向在升温。";
    }

    let lineText = "盘口没有明显变化，说明机构暂时没有明显提高或降低门槛。";
    if (lineMove.movement === "盘口升深") {
      lineText = "盘口升深，意思是强势方需要赢更多才算打出，这可能是真支持，也可能是机构提高门槛来控制热门风险。";
    } else if (lineMove.movement === "盘口退浅") {
      lineText = "盘口退浅，意思是强势方门槛降低，通常代表机构对强势方信心下降，或者市场有反向资金进入。";
    }

    const riskText = profile.upset > 60
      ? "爆冷潜力偏高，这场不适合只看热门方向。"
      : profile.upset > 40
        ? "有一定爆冷空间，需要保留防守方案。"
        : "爆冷信号暂时不明显，可以更多关注主方向是否继续被盘口支持。";

    return {
      headline: `${lineMove.movement}，${profile.signal}`,
      items: [
        ["盘口表达", lineText],
        ["水位表达", waterText],
        ["市场热度", profile.heatRisk],
        ["冷门提醒", riskText]
      ],
      conclusion: `${lineText}${waterText}${riskText}`
    };
  }

  function finalPrediction(m) {
    const profile = handicapProfile(m);
    const rational = handicapRationality(m);
    const market = fullScoreMarket(m);
    const hotScores = [...market].sort((a, b) => a.change - b.change).slice(0, 4).map(x => x.score);
    const goal = bestGoal(m)[0];
    const favorite = m.probs.home > m.probs.away ? m.home : m.away;
    const drawRisk = m.probs.draw >= 30 || hotScores.some(s => s.includes(":") && s.split(":")[0] === s.split(":")[1]);
    let direction = `${favorite}方向`;
    if (profile.upset > 62) direction = "防冷门";
    else if (drawRisk) direction = `${favorite}不败，防平`;

    let confidence = Math.round((m.confidence * .45) + (rational.score * .35) + ((100 - profile.upset) * .20));
    confidence = Math.max(20, Math.min(92, confidence));
    return {
      direction,
      scoreZone: hotScores.slice(0, 3).join(" / "),
      goalZone: goal,
      confidence
    };
  }

  function bettingReferencePlan(m) {
    const risk = riskControlScore(m);
    const profile = handicapProfile(m);
    const final = finalPrediction(m);
    const hotMarket = [...fullScoreMarket(m)].sort((a, b) => a.change - b.change);
    const mainScores = hotMarket.slice(0, 3).map(x => x.score).join(" / ");
    const drawScores = hotMarket.filter(x => x.type === "平局").slice(0, 2).map(x => x.score).join(" / ") || "1:1 / 0:0";
    const coldScores = hotMarket.filter(x => x.type !== (m.probs.home >= m.probs.away ? "主胜" : "客胜") && x.type !== "平局").slice(0, 2).map(x => x.score).join(" / ") || "0:1 / 1:2";
    const favTeam = m.probs.home >= m.probs.away ? m.home : m.away;
    const underdog = m.probs.home >= m.probs.away ? m.away : m.home;
    const goal = bestGoal(m)[0];
    const result = profile.upset > 62 ? `${underdog}不败方向` : final.direction.includes("防平") ? `${favTeam}不败` : `${favTeam}方向`;
    const coverResult = profile.upset > 62 ? `${favTeam}方向少量防守` : "平局或冷门防守";
    return {
      main: {
        grade: risk.action,
        result,
        scores: mainScores,
        goals: goal,
        handicap: profile.signal
      },
      cover: {
        grade: profile.upset > 60 ? "必须防" : "可选防",
        result: coverResult,
        scores: profile.upset > 60 ? coldScores : drawScores,
        goals: goal.includes("0-1") ? "小球优先" : goal,
        usage: "用于防临场反向变化"
      }
    };
  }

  function liveConfirmation(m) {
    const profile = handicapProfile(m);
    return [
      { name: "让球盘口", condition: "盘口升盘且上盘不升水", action: "主方向可信度提高" },
      { name: "水位反向", condition: "热门方向临场升水，下盘降水", action: "降低主方向，转为防冷或过滤" },
      { name: "多家公司", condition: "3家以上公司同方向变盘", action: "信号加强；如果分歧大则继续等待" },
      { name: "波胆热区", condition: "主方向比分集体降赔", action: "候选比分可信度提高" },
      { name: "首发消息", condition: "核心球员缺阵或轮换", action: "重新计算胜平负和进球数" },
      {
        name: "当前状态",
        condition: profile.upset > 60 ? "爆冷潜力偏高" : "爆冷信号未明显放大",
        action: profile.upset > 60 ? "必须保留防守方案" : "按主方案观察临场"
      }
    ];
  }

  function bookmakerConsensus(m) {
    const profile = handicapProfile(m);
    const h = m.handicap.homeWater;
    const a = m.handicap.awayWater;
    const baseHome = last(h);
    const baseAway = last(a);
    const baseLine = last(handicapTimeline(m)).line;
    const variants = [
      { name: "A公司", lineShift: 0, homeAdjust: 0.00, awayAdjust: 0.00 },
      { name: "B公司", lineShift: profile.signal === "上盘受热" ? 0 : -0.25, homeAdjust: 0.03, awayAdjust: -0.02 },
      { name: "C公司", lineShift: profile.signal === "下盘升温" ? -0.25 : 0, homeAdjust: -0.02, awayAdjust: 0.03 },
      { name: "D公司", lineShift: 0, homeAdjust: 0.01, awayAdjust: -0.01 },
      { name: "E公司", lineShift: profile.upset > 60 ? -0.25 : 0, homeAdjust: profile.upset > 60 ? 0.05 : -0.01, awayAdjust: profile.upset > 60 ? -0.04 : 0.02 }
    ];
    const books = variants.map(v => {
      const homeWater = Number((baseHome + v.homeAdjust).toFixed(2));
      const awayWater = Number((baseAway + v.awayAdjust).toFixed(2));
      const signal = homeWater < awayWater ? "偏上盘" : homeWater > awayWater ? "偏下盘" : "均衡";
      return {
        name: v.name,
        line: shiftLine(baseLine, v.lineShift),
        homeWater,
        awayWater,
        signal
      };
    });
    const mainSignal = books[0].signal;
    const same = books.filter(b => b.signal === mainSignal).length;
    const consistency = Math.round(same / books.length * 100);
    const comment = consistency >= 80
      ? "多家公司方向接近，盘口信号可信度较高，但仍要看是否热门过热。"
      : consistency >= 60
        ? "多数公司方向一致，但仍有分歧，适合继续跟踪临场变化。"
        : "公司之间分歧明显，不适合过早下结论，风控上应降低信心。";
    return { books, consistency, comment };
  }

  function shiftLine(line, shift) {
    if (!shift) return line;
    const match = line.match(/(.+?)\s(-?\d+(?:\.\d+)?)/);
    if (!match) return line;
    const team = match[1];
    const value = Number(match[2]) + shift;
    return `${team} ${value > 0 ? "+" : ""}${value}`;
  }

  function riskControlScore(m) {
    const profile = handicapProfile(m);
    const rational = handicapRationality(m);
    const consensus = bookmakerConsensus(m);
    const market = fullScoreMarket(m);
    const hot = [...market].sort((a, b) => a.change - b.change).slice(0, 8);
    const favType = m.probs.home >= m.probs.away ? "主胜" : "客胜";
    const favHot = hot.filter(x => x.type === favType).length;
    const coldHot = hot.filter(x => x.type !== favType && x.type !== "平局").length;
    const drawHot = hot.filter(x => x.type === "平局").length;
    const goalTop = bestGoal(m)[0];

    const handicapChangeScore = rational.score;
    const waterScore = profile.signal === "上盘受热" ? 72 : profile.signal === "下盘升温" ? 46 : 60;
    const heatScore = profile.heat > 80 ? 42 : profile.heat > 65 ? 58 : 72;
    const upsetScore = 100 - profile.upset;
    const scoreOddsScore = favHot >= 3 ? 75 : coldHot >= 2 ? 42 : drawHot >= 2 ? 55 : 62;
    const goalScore = goalTop.includes("2-3") ? 66 : goalTop.includes("0-1") ? 58 : 52;
    const consensusScore = consensus.consistency;

    const weights = CONFIG.weights;
    const parts = [
      { name: "让球盘口变化", weight: weights.handicapChange, score: handicapChangeScore, note: rational.level },
      { name: "上下盘水位", weight: weights.waterDirection, score: waterScore, note: profile.waterDirection },
      { name: "多家公司一致性", weight: weights.bookmakerConsensus, score: consensusScore, note: consensus.comment },
      { name: "市场热度控制", weight: weights.marketHeat, score: heatScore, note: profile.heatRisk },
      { name: "爆冷风险控制", weight: weights.upsetControl, score: upsetScore, note: profile.upsetText },
      { name: "波胆热区配合", weight: weights.scoreOddsFit, score: scoreOddsScore, note: favHot >= 3 ? "波胆支持主方向" : coldHot >= 2 ? "冷门波胆偏热" : "波胆信号一般" },
      { name: "进球数配合", weight: weights.goalsFit, score: goalScore, note: `当前倾向 ${goalTop}` }
    ];

    const total = Math.round(parts.reduce((sum, p) => sum + p.score * p.weight / 100, 0));
    const riskLevel = total >= CONFIG.riskThresholds.focus ? CONFIG.labels.lowRisk : total >= CONFIG.riskThresholds.wait ? CONFIG.labels.midRisk : CONFIG.labels.highRisk;
    const action = total >= CONFIG.riskThresholds.focus ? CONFIG.labels.focus : total >= CONFIG.riskThresholds.wait ? CONFIG.labels.wait : CONFIG.labels.filter;
    const reverseRisks = [
      ["热门过热", profile.heat > 75 ? "偏高" : "可接受", "热度高但盘口不配合时，容易出问题"],
      ["冷门波胆", coldHot >= 2 ? "有异动" : "不明显", "冷门比分持续降赔，要降低主方向信心"],
      ["平局风险", drawHot >= 2 ? "偏高" : "一般", "淘汰赛或强强对话，平局权重要提高"],
      ["公司分歧", consensus.consistency < 60 ? "明显" : "不明显", "多家公司不一致时，不宜过早判断"]
    ];
    return { total, riskLevel, action, parts, reverseRisks };
  }

  const api = {
    bestGoal,
    fullScoreMarket,
    estimateScoreOdds,
    handicapTimeline,
    lineMovementSummary,
    scoreHeatSummary,
    handicapPlainExplanation,
    handicapProfile,
    handicapRationality,
    finalPrediction,
    bettingReferencePlan,
    liveConfirmation,
    bookmakerConsensus,
    riskControlScore
  };

  window.ScoringEngine = api;
  Object.assign(window, api);
})();
