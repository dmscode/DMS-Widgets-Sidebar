# DMS: 挂件侧边栏

<div align="middle">
  <a href="README.md">
    <img src="https://img.shields.io/badge/English-blue?style=for-the-badge&logo=markdown" alt="English">
  </a>
  <img src="https://img.shields.io/badge/中文-gray?style=for-the-badge&logo=markdown" alt="中文">
</div>

一个 Obsidion 的侧边栏挂件系统。

## 安装

- 从 Releases 页面下载最新版本，解压到 `Vault/.obsidian/plugins/dms-widget-sidebar` 文件夹中。
- 在 Obsidian 中启用插件。

## 使用

- 在插件设置中可以为侧边栏添加多个小挂件
- 左侧 Ribbon 中可以激活挂件侧边栏

## 挂件

### 标题

分为两种：大标题和小标题。会分别渲染为1号标题和3号标题。

挂件代码会被作为标题内容。

### 数字时钟

显示当前时间，格式为`HH:mm`。此挂件无需设置代码。

### 时光进度

显示年、月、周、日的进度。此挂件无需设置代码。

### 周历

显示当前周的日历。此挂件无需设置代码。

### 月历

显示当前月的日历。此挂件无需设置代码。

### 文本

挂件的代码会被当作 Markdown 渲染。

### 图片

挂件的代码会被当作图片的路径。可以使用网络图片，也可以使用本地图片。如果是本地图片则图片路径相对于仓库的根目录。

## 自定义类型

自定义类型的挂件会作为代码块进行渲染，你所设定的类型作为代码块的语言。这可以用来添加各种可以被特殊渲染的代码块，比如：`dataviewjs`。

这意味着你可以利用许多第三方插件来创建自己的挂件。

需要注意的是，因为这些挂件处于侧边栏视图而不是笔记之中，所以第三方插件并不能获得比如当前笔记之类的数据。

## 请我喝杯咖啡吧

如果你觉得这个插件对你有帮助，你可以请我喝杯咖啡。—— [老鼠爱发电](https://afdian.com/a/daomishu)