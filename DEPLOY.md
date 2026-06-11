# 手机上传 GitHub 和开启网页说明

你的仓库地址：

```text
https://github.com/UIYES/worldcup-odds-risk-control.git
```

项目上线后的网页地址预计是：

```text
https://uiyes.github.io/worldcup-odds-risk-control/
```

## 第一步：上传文件

手机操作时，建议先上传这个压缩包里的文件：

```text
worldcup-odds-risk-control-handoff.zip
```

如果 GitHub App 不方便上传文件夹，可以用手机浏览器打开 GitHub 网页版操作。

打开仓库网页：

```text
https://github.com/UIYES/worldcup-odds-risk-control
```

然后按下面做：

1. 点 `Add file`
2. 点 `Upload files`
3. 选择项目里的文件和文件夹
4. 等上传完成
5. 页面底部点绿色按钮 `Commit changes`

需要上传的核心内容：

```text
index.html
worldcup-backtest-prototype.html
worldcup-mobile-standalone.html
worldcup-jsbox.js
worldcup-jsbox-online.js
README.md
DEPLOY.md
data/
engine/
docs/
```

## 第二步：开启 GitHub Pages

文件上传完成后：

1. 打开仓库
2. 点 `Settings`
3. 找到 `Pages`
4. Source 选择 `Deploy from a branch`
5. Branch 选择 `main`
6. Folder 选择 `/root`
7. 点 `Save`

等 1 到 3 分钟，GitHub 会生成网页地址。

## 第三步：打开网页

预计地址：

```text
https://uiyes.github.io/worldcup-odds-risk-control/
```

如果打不开，等几分钟再试。

## 第四步：JSBox 在线版

网页能打开后，可以把这个文件内容复制到 JSBox：

```text
worldcup-jsbox-online.js
```

以后 JSBox 会直接打开 GitHub Pages 在线网页。

## 常见问题

如果打开网页是 404：

- 检查仓库是不是 Public
- 检查有没有 `index.html`
- 检查 Pages 是否选择了 `main / root`
- 等 1 到 3 分钟再刷新

如果页面打开但样式或功能不对：

- 检查 `data/` 文件夹是否上传
- 检查 `engine/` 文件夹是否上传
- 检查文件名大小写是否一致
