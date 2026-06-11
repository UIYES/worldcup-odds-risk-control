// 模型复盘建议模块
// 目标：把多场比赛的复盘结果汇总成"下一步该调什么"的建议。
// 注意：这里只给建议，不自动修改权重。任何权重调整都必须再经过历史回测验证。
(function () {
  const ADVICE_RULES = {
    "热门过热未过滤": {
      target: "降低热门过热场次评分",
      suggestion: "市场热度过高时，不要继续给主方向加分；应提高控赔、诱导和防冷权重。",
      configHint: "重点观察 marketHeat 和 upsetControl 的权重关系。"
    },
    "退盘信号低估": {
      target: "提高退盘惩罚",
      suggestion: "强势方从深盘退浅时，应明显降低主方向信心，并把比赛归入等临场确认。",
      configHint: "重点观察 handicapChange 的退盘扣分逻辑。"
    },
    "下盘降水未重视": {
      target: "提高下盘升温权重",
      suggestion: "下盘持续降水时，说明弱势方或冷门方向有资金支撑，应提高爆冷预警。",
      configHint: "重点观察 waterDirection 和 upsetControl。"
    },
    "平局风险低估": {
      target: "提高防平权重",
      suggestion: "淘汰赛、浅盘、平局波胆降赔时，应把平局放进防守方案。",
      configHint: "后期可把 stage、盘口深度、平局波胆一起纳入防平规则。"
    },
    "冷门波胆异动未加权": {
      target: "提高冷门波胆权重",
      suggestion: "冷门比分连续降赔时，不能只看胜平负主方向，应提高冷门保护。",
      configHint: "重点观察 scoreOddsFit 和 upsetControl。"
    },
    "多家公司分歧未降权": {
      target: "提高分歧场过滤力度",
      suggestion: "多家公司方向不一致时，默认降低置信度，避免提前给强结论。",
      configHint: "重点观察 bookmakerConsensus。"
    },
    "进球区间判断偏差": {
      target: "加强大小球和比赛节奏数据",
      suggestion: "当前进球区间只靠粗粒度概率，后期应加入大小球盘口、水位和临场节奏信息。",
      configHint: "重点观察 goalsFit，后期增加大小球时间线。"
    },
    "比分区间覆盖不足": {
      target: "扩大候选比分覆盖",
      suggestion: "候选比分不能只看最热比分，应加入相邻比分、冷门比分和其他比分分组。",
      configHint: "重点观察 scoreOddsFit 和 scoreProb 生成方式。"
    }
  };

  function rateText(part, total) {
    return total ? `${Math.round(part / total * 100)}%` : "暂无";
  }

  function modelAdvice(matches) {
    const review = reviewTournament(matches);
    const stats = backtestStats(matches);
    const reviews = review.reviews;
    const total = reviews.length;
    const misses = reviews.filter(r => !r.directionHit);
    const goalMisses = reviews.filter(r => !r.goalZoneHit);
    const scoreMisses = reviews.filter(r => !r.scoreZoneHit);

    const reasonCount = {};
    reviews.forEach(r => {
      r.reasons.forEach(reason => {
        if (reason.label === "判断基本合理") return;
        if (!reasonCount[reason.label]) {
          reasonCount[reason.label] = { reason: reason.label, count: 0, matches: [] };
        }
        reasonCount[reason.label].count += 1;
        reasonCount[reason.label].matches.push(`${r.match.home} vs ${r.match.away}`);
      });
    });

    const ranked = Object.values(reasonCount).sort((a, b) => b.count - a.count);
    const suggestions = ranked.slice(0, 5).map(item => {
      const rule = ADVICE_RULES[item.reason] || {
        target: "继续观察",
        suggestion: "这个问题出现次数还不够多，先增加样本再判断是否调整规则。",
        configHint: "暂不建议改权重。"
      };
      const urgency = item.count >= 3 ? "高" : item.count === 2 ? "中" : "低";
      return {
        reason: item.reason,
        count: item.count,
        urgency,
        target: rule.target,
        suggestion: rule.suggestion,
        configHint: rule.configHint,
        matches: item.matches.slice(0, 3)
      };
    });

    const summary = [
      ["回测场次", `${total} 场`],
      ["方向失手", `${misses.length} 场（${rateText(misses.length, total)}）`],
      ["进球区间偏差", `${goalMisses.length} 场（${rateText(goalMisses.length, total)}）`],
      ["比分区间未覆盖", `${scoreMisses.length} 场（${rateText(scoreMisses.length, total)}）`],
      ["方向命中率", stats.directionRate],
      ["冷门预警有效", stats.upsetWarnRate]
    ];

    let headline = "样本还少，先继续积累历史比赛，不建议大幅调整权重。";
    if (total >= 8 && suggestions.length) {
      headline = `当前最需要关注"${suggestions[0].reason}"，它在 ${suggestions[0].count} 个复盘点里反复出现。`;
    }
    if (misses.length / Math.max(total, 1) >= 0.45) {
      headline += " 方向失手比例偏高，说明热门过滤和冷门保护需要重点验证。";
    }

    return {
      total,
      headline,
      summary,
      suggestions,
      rows: suggestions.map(s => [
        s.reason,
        `${s.count}次`,
        s.urgency,
        s.target,
        s.suggestion
      ])
    };
  }

  const api = { modelAdvice };
  window.ModelAdviceEngine = api;
  Object.assign(window, api);
})();
