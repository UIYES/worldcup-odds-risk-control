// 盘口意图判断模块
// 目标：把"盘口怎么变"进一步翻译成"机构可能想表达什么"。
// 注意：这里是风控判断，不是保证结果。后期接真实多家公司数据后，需要用回测继续修正规则。
(function () {
  function last(arr) {
    return arr[arr.length - 1];
  }

  function getLineIntent(m) {
    const profile = handicapProfile(m);
    const lineMove = lineMovementSummary(m);
    const timeline = handicapTimeline(m);
    const first = timeline[0];
    const latest = last(timeline);
    const homeWaterMove = Number((latest.homeWater - first.homeWater).toFixed(2));
    const awayWaterMove = Number((latest.awayWater - first.awayWater).toFixed(2));
    const consensus = bookmakerConsensus(m);
    const heat = scoreHeatSummary(m);
    const rational = handicapRationality(m);
    const favoriteSide = m.probs.home >= m.probs.away ? "主队方向" : "客队方向";
    const evidence = [];
    let type = "暂不明确";
    let confidence = 52;
    let plain = "目前盘口、水位、波胆之间没有形成足够清晰的一致信号，适合继续观察。";
    let action = "不要提前下重结论，等临场盘口和多家公司方向更清楚。";

    const isHotFavorite = profile.signal === "上盘受热" && profile.heat >= 72;
    const isReverseWater = profile.signal === "下盘升温";
    const isDeepen = lineMove.movement === "盘口升深";
    const isRetreat = lineMove.movement === "盘口退浅";
    const hasHighConsensus = consensus.consistency >= 80;
    const hasLowConsensus = consensus.consistency < 60;
    const hasUpsetRisk = profile.upset >= 60;
    const hasColdHeat = heat.upsetHint.includes("冷门") || heat.upsetHint.includes("防平");
    const isRational = rational.score >= 70;

    evidence.push(`盘口：${lineMove.opening} → ${lineMove.closing}，${lineMove.movement}`);
    evidence.push(`水位：上盘 ${first.homeWater} → ${latest.homeWater}，下盘 ${first.awayWater} → ${latest.awayWater}`);
    evidence.push(`热度：${profile.heat}%；冷门风险：${profile.upset}%`);
    evidence.push(`多家公司一致性：${consensus.consistency}%`);

    if (hasLowConsensus) {
      type = "分歧大";
      confidence = 62;
      plain = "多家公司方向不够一致，说明市场和机构之间还没有形成统一态度。";
      action = "这类比赛不适合提前判断，等临场至少 3 家以上公司同方向再考虑。";
    } else if (isReverseWater || (isRetreat && hasUpsetRisk)) {
      type = "阻上";
      confidence = 70;
      plain = "热门方向开始变得不舒服，机构没有给强势方很顺的条件，弱势方或冷门方向在升温。";
      action = "降低热门方向权重，优先保留平局或冷门防守方案。";
    } else if (isDeepen && isHotFavorite && hasHighConsensus && profile.heat >= 80) {
      type = "控赔";
      confidence = 74;
      plain = "强势方太热，机构通过更深盘口或调水提高门槛，核心目的可能是控制热门方向赔付。";
      action = "不要只看热门，必须检查波胆冷门和平局热区，避免追高。";
    } else if (isDeepen && profile.signal === "上盘受热" && hasHighConsensus && isRational && !hasColdHeat) {
      type = "真支持";
      confidence = 76;
      plain = `盘口、水位、多家公司方向较一致，比较像机构真的认可${favoriteSide}。`;
      action = "可以列入重点跟踪，但仍要等临场确认上盘是否继续稳定。";
    } else if (isHotFavorite && !isRational && (hasColdHeat || hasUpsetRisk)) {
      type = "诱导";
      confidence = 66;
      plain = "表面看热门方向很热，但盘口合理性、冷门风险或波胆热区并不完全配合，可能在吸引大众追热门。";
      action = "这类比赛宁可少碰，若参与也要把防平、防冷放在前面。";
    }

    const riskNote = {
      真支持: "最怕临场突然升水或退盘，一旦发生，真支持要改成等待确认。",
      控赔: "热门方向不是不能看，但价格可能已经不好，追热门容易买在高点。",
      阻上: "强势方未必不能赢，但盘口正在提醒它赢得不舒服。",
      诱导: "这类信号最容易让新手误以为热门很稳，需要用波胆和多家公司反查。",
      分歧大: "分歧大的比赛最大问题不是方向错，而是过早下结论。",
      暂不明确: "信号不清楚时，过滤往往比强行分析更好。"
    }[type];

    return {
      type,
      confidence,
      plain,
      action,
      riskNote,
      evidence: [
        ...evidence,
        `波胆：${heat.plainText}`,
        `盘口合理性：${rational.score}，${rational.level}`
      ],
      factors: [
        ["盘口意图", type],
        ["判断信心", confidence + "%"],
        ["大白话", plain],
        ["处理建议", action],
        ["风险提醒", riskNote]
      ],
      raw: {
        homeWaterMove,
        awayWaterMove,
        lineMove,
        profile,
        consensus,
        heat,
        rational
      }
    };
  }

  const api = { getLineIntent };
  window.IntentEngine = api;
  Object.assign(window, api);
})();
