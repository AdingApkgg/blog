---
title: 关于站长与本站
date: 2023-02-04 18:00:00
type: "about"
updated: 2025-04-17 12:55:40
comments: false
description:
keywords:
mathjax:
katex:
aside:
aplayer:
highlight_shrink:
top_img:
---

![](/img/moe/moe_60.webp)

<meting-js class="no-destroy" id="22635185" server="netease" type="song" autoplay="true" order="random" volume="0.5"></meting-js>

## 关于我

- **你好陌生人，我是 [Asuna](https://swordartonline.fandom.com/zh/wiki/%E7%BB%93%E5%9F%8E%E6%98%8E%E6%97%A5%E5%A5%88)**
- **生于 21 世纪初的年轻 [武装直升机](https://zh.wikipedia.org/wiki/%E6%AD%A6%E8%A3%85%E7%9B%B4%E5%8D%87%E6%9C%BA)**
- **喜欢遐想、计算机、AI、潜行 MMO、漫文化、睡觉、{% hideInline 合法萝莉 点此显示 %}**
- **喜欢~~可爱又羞涩的~~{% hideInline 女孩子！, 点此显示 %}**
- **是个 [不可知论](https://zh.wikipedia.org/zh-hans/%E4%B8%8D%E5%8F%AF%E7%9F%A5%E8%AE%BA%E8%80%85) 者捏~ 否认人格化 `神` 的存在**

### 最近在沉迷什么

- **沉迷原神无法自拔，UID198060257，可以来找我玩！**
- **将 ChatGPT 调教成听话的猫娘（无端联想）...**
- **补老番，追新番，熬厕纸**

### 性格&人格

[调停者（INFP-A）](https://www.16personalities.com/ch/infp-人格?utm_source=results-assertive-mediator&utm_medium=email&utm_campaign=ch&utm_content=type-personality-0) > 内向：74%、直觉：63%、感受：52%、展望：61%、坚决：54%

![](/img/16personalities.webp)

## 关于本站

<script>
    function secondToDate(second) {
        if (!second) {
            return 0;
        }
        var time = new Array(0, 0, 0, 0, 0);
        if (second >= 365 * 24 * 3600) {
            time[0] = parseInt(second / (365 * 24 * 3600));
            second %= 365 * 24 * 3600;
        }
        if (second >= 24 * 3600) {
            time[1] = parseInt(second / (24 * 3600));
            second %= 24 * 3600;
        }
        if (second >= 3600) {
            time[2] = parseInt(second / 3600);
            second %= 3600;
        }
        if (second >= 60) {
            time[3] = parseInt(second / 60);
            second %= 60;
        }
        if (second > 0) {
            time[4] = second;
        }
        return time;
    }
</script>

<script type="text/javascript">
    function setTime() {
        // 博客创建时间秒数，时间格式中，月比较特殊，是从0开始的，所以想要显示5月，得写4才行，如下
        var create_time = Math.round(new Date(Date.UTC(2022, 12, 6, 0, 0, 0))
                .getTime() / 1000);
        // 当前时间秒数,增加时区的差异
        var timestamp = Math.round((new Date().getTime() + 8 * 60 * 60 * 1000) / 1000);
        currentTime = secondToDate((timestamp - create_time));
        currentTimeHtml = currentTime[0] + ' 年 ' + currentTime[1] + ' 天 '
                + currentTime[2] + ' 时 ' + currentTime[3] + ' 分 ' + currentTime[4]
                + ' 秒';
        document.getElementById("htmer_time").innerHTML = currentTimeHtml;
    }
    setInterval(setTime, 1000);
</script>

- **本博客始建于 2023 年 01 月 06 日**
- <strong>距今已艰难运行了&nbsp;<span id="htmer_time"></span></strong>
- **本站使用 [GitHub](https://github.com/) 作为源码托管平台**
- **主线路托管于 [Cloudflare](https://www.cloudflare.com/) 并配置域名 `saop.cc` 以支持大陆访问**
- **由 [Hexo](https://hexo.io/zh-cn/) 框架与 [Butterfly](https://butterfly.js.org/) 主题强力驱动！**
