// 世界杯赔率风控分析 - JSBox 在线版入口
// 使用方法：等 GitHub Pages 开通后，把这个脚本复制到 JSBox 运行。
// 它不会内嵌项目代码，而是直接打开你的 GitHub Pages 在线网页。

const url = "https://uiyes.github.io/worldcup-odds-risk-control/";

$ui.render({
  props: {
    title: "世界杯赔率风控",
    navButtons: [
      {
        title: "刷新",
        handler: () => {
          const web = $("webview");
          if (web) web.reload();
        }
      }
    ]
  },
  views: [
    {
      type: "web",
      props: {
        id: "webview",
        url
      },
      layout: $layout.fill
    }
  ]
});
