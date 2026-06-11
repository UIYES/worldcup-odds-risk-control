// 赛事注册表（届别选择的数据源）
// 后期增加新届/新联赛只需要：
//   1. 新建一个数据文件（如 data/matches-euro2024.js），导出 window.MATCHES_EURO2024
//   2. 在 index.html 加一行 <script src="..."> 引用
//   3. 在下面的 TOURNAMENTS 数组里追加一项
// 评分引擎、UI、配置都不需要改，保证后期可维护性。
//
// 字段说明：
//   id         唯一标识，用于 localStorage 记忆用户选择
//   name       完整名字（详情页用）
//   short      列表/下拉框展示的短名
//   year       年份（用于排序）
//   type       赛事类型：worldcup / euro / club / league
//   status     已结束 / 进行中 / 未开始
//   dataKey    实际数据挂载到 window 的变量名
//   description 选择该赛事时的引导说明
window.TOURNAMENTS = [
  {
    id: "wc2026",
    name: "2026 美加墨世界杯",
    short: "2026 世界杯",
    year: 2026,
    type: "worldcup",
    status: "未开始",
    dataKey: "MATCHES_2026",
    description: "项目最终目标。等抽签和盘口数据就绪后，切到这里就能用同一套分析流程。"
  },
  {
    id: "wc2022",
    name: "2022 卡塔尔世界杯",
    short: "2022 世界杯",
    year: 2022,
    type: "worldcup",
    status: "已结束",
    dataKey: "MATCHES_2022",
    description: "用于回测的历史数据。先在这里把分析方法跑通，命中和失手都能看见。"
  },
  {
    id: "wc2018",
    name: "2018 俄罗斯世界杯",
    short: "2018 世界杯",
    year: 2018,
    type: "worldcup",
    status: "已结束",
    dataKey: "MATCHES_2018",
    description: "再加一届世界杯做交叉验证，看看同一套分析方法在不同年份是不是都说得通。"
  }
];

// 默认选中的赛事（首次访问时用）
window.DEFAULT_TOURNAMENT_ID = "wc2022";
