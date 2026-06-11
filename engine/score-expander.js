// 比分覆盖优化模拟模块
// 目标：不改正式模型的候选比分，模拟扩展候选集后覆盖率的变化。
// 仅用于对比展示，不替换正式推荐。
(function () {

  // 解析 "2:1" 这样的比分字符串为 [2, 1]
  function parseScore(score) {
    const parts = score.split(":").map(Number);
    return [parts[0], parts[1]];
  }

  // 构造比分字符串
  function makeScore(h, a) {
    return `${h}:${a}`;
  }

  // 从正式模型取出原始候选比分（通常 3 个）
  function originalCandidateScores(m) {
    const final = finalPrediction(m);
    return final.scoreZone.split(" / ").filter(Boolean);
  }

  // 扩展类型 1：相邻比分
  // 对每个候选比分，±1 主队进球、±1 客队进球
  function adjacentScores(scores) {
    const set = new Set();
    scores.forEach(s => {
      const [h, a] = parseScore(s);
      [[h - 1, a], [h + 1, a], [h, a - 1], [h, a + 1]].forEach(([nh, na]) => {
        if (nh >= 0 && na >= 0 && nh <= 7 && na <= 7) {
          set.add(makeScore(nh, na));
        }
      });
    });
    return Array.from(set);
  }

  // 扩展类型 2：平局比分
  // 0:0 到 3:3 之间的平局
  function drawScores() {
    return ["0:0", "1:1", "2:2", "3:3"];
  }

  // 扩展类型 3：冷门比分（反方向比分）
  // 如果热门方向是主胜，补充客胜方向的合理比分
  function upsetScores(m) {
    const favHome = m.probs.home >= m.probs.away;
    if (favHome) {
      // 主胜是热门，补充客胜方向的冷门比分
      return ["0:1", "1:2", "0:2", "1:3"];
    } else {
      // 客胜是热门，补充主胜方向的冷门比分
      return ["1:0", "2:1", "2:0", "3:1"];
    }
  }

  // 扩展类型 4：大比分/高进球比分
  // 总进球 ≥5 的比分（根据进球概率决定是否加入）
  function highGoalScores(m) {
    const goalHigh = m.goals.find(g => g[0].includes("4"));
    const probability = goalHigh ? goalHigh[1] : 0;
    if (probability < 15) return []; // 高进球概率不高就不加
    const favHome = m.probs.home >= m.probs.away;
    if (favHome) {
      return ["3:0", "4:1", "3:2", "5:1"];
    } else {
      return ["0:3", "1:4", "2:3", "1:5"];
    }
  }

  // 合并所有扩展来源，去重，返回扩展后的候选比分列表
  function expandScoreZone(m) {
    const base = originalCandidateScores(m);
    const adjacent = adjacentScores(base);
    const draw = drawScores();
    const upset = upsetScores(m);
    const high = highGoalScores(m);

    const combined = new Set();
    [...base, ...adjacent, ...draw, ...upset, ...high].forEach(s => combined.add(s));

    const expanded = Array.from(combined);
    return {
      original: base,
      adjacent,
      draw,
      upset,
      high,
      expanded,
      expandedCount: expanded.length,
      originalCount: base.length
    };
  }

  // 扩展后比分是否命中实际比分
  function expandedHit(m) {
    if (!m.actual) return false;
    const expanded = expandScoreZone(m).expanded;
    return expanded.includes(m.actual);
  }

  // 原始候选是否命中实际比分
  function originalHit(m) {
    if (!m.actual) return false;
    return originalCandidateScores(m).includes(m.actual);
  }

  // 计算一组比赛扩展前后的覆盖率对比
  function scoreExpansionStats(list) {
    const finished = list.filter(m => m.actual);
    const total = finished.length;
    if (!total) {
      return {
        total: 0,
        originalRate: "暂无",
        expandedRate: "暂无",
        improved: "暂无",
        extraHits: [],
        originalMisses: []
      };
    }

    const originalHitCount = finished.filter(m => originalHit(m)).length;
    const expandedHitCount = finished.filter(m => expandedHit(m)).length;

    const extraHits = finished
      .filter(m => expandedHit(m) && !originalHit(m))
      .map(m => ({
        match: `${m.home} vs ${m.away}`,
        actual: m.actual,
        original: originalCandidateScores(m).join(" / "),
        caughtBy: classifyHitSource(m)
      }));

    const originalMisses = finished
      .filter(m => !expandedHit(m))
      .map(m => ({
        match: `${m.home} vs ${m.away}`,
        actual: m.actual,
        original: originalCandidateScores(m).join(" / ")
      }));

    return {
      total,
      originalRate: Math.round(originalHitCount / total * 100) + "%",
      expandedRate: Math.round(expandedHitCount / total * 100) + "%",
      improved: "+" + (expandedHitCount - originalHitCount) + " 场",
      originalHitCount,
      expandedHitCount,
      extraHits,
      originalMisses,
      avgOriginalSize: Math.round(finished.reduce((s, m) => s + originalCandidateScores(m).length, 0) / total * 10) / 10,
      avgExpandedSize: Math.round(finished.reduce((s, m) => s + expandScoreZone(m).expanded.length, 0) / total * 10) / 10
    };
  }

  // 判断扩展命中是哪一类扩展来源贡献的
  function classifyHitSource(m) {
    if (!m.actual || originalHit(m)) return "";
    const actual = m.actual;
    const base = originalCandidateScores(m);
    const expanded = expandScoreZone(m);

    if (expanded.adjacent.includes(actual)) return "相邻比分扩展";
    if (expanded.draw.includes(actual)) return "平局比分扩展";
    if (expanded.upset.includes(actual)) return "冷门比分扩展";
    if (expanded.high.includes(actual)) return "大比分扩展";
    return "其他";
  }

  // 按赛事分组计算扩展前后的覆盖率
  function scoreExpansionPerTournament(tournaments) {
    const groups = historicalTournamentMatches(tournaments);
    return groups.map(group => {
      const stats = scoreExpansionStats(group.matches);
      return {
        tournament: group.tournament.short,
        total: stats.total,
        originalRate: stats.originalRate,
        expandedRate: stats.expandedRate,
        improved: stats.improved
      };
    });
  }

  // 展示用的扩展来源摘要
  function expansionSummary(list) {
    const stats = scoreExpansionStats(list);
    const hitSource = { "相邻比分扩展": 0, "平局比分扩展": 0, "冷门比分扩展": 0, "大比分扩展": 0, "其他": 0 };
    stats.extraHits.forEach(h => {
      if (hitSource[h.caughtBy] !== undefined) hitSource[h.caughtBy]++;
    });

    const rows = Object.entries(hitSource)
      .filter(([, v]) => v > 0)
      .map(([k, v]) => [k, v + " 场", stats.extraHits.filter(h => h.caughtBy === k).slice(0, 3).map(h => h.match).join(" / ")]);

    return {
      originalVsExpanded: [
        ["原始候选（正式模型）", stats.originalRate, `每场约 ${stats.avgOriginalSize} 个比分`],
        ["扩展候选（模拟）", stats.expandedRate, `每场约 ${stats.avgExpandedSize} 个比分`],
        ["改进", stats.improved, "仅模拟，不替换正式推荐"]
      ],
      sourceRows: rows.length ? rows : [["暂无", "—", "当前样本扩展后没有新增命中"]],
      stillMissRows: stats.originalMisses.length
        ? stats.originalMisses.slice(0, 4).map(m => [m.match, m.actual, m.original])
        : [["暂无", "—", "扩展后全部命中"]]
    };
  }

  // 为多视图页面提供统一接口：返回每场比赛的候选、扩展前后命中情况
  function analyzeMatches(list) {
    return list.map(m => {
      const original = originalCandidateScores(m);
      const expanded = expandScoreZone(m);
      return {
        match: m,
        original: original,
        candidates: expanded,
        originalHit: originalHit(m),
        expandedHit: expandedHit(m)
      };
    });
  }

  const api = {
    expandScoreZone,
    expandedHit,
    originalHit,
    originalCandidateScores,
    scoreExpansionStats,
    scoreExpansionPerTournament,
    expansionSummary,
    analyzeMatches
  };

  window.ScoreExpander = api;
  window.ScoreExpanderEngine = api;
  Object.assign(window, api);
})();
