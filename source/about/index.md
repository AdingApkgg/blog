---
title: 关于站长与本站
date: 2023-02-04 18:00:00
type: "about"
updated: 2024-10-26 00:00:00
comments:
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

<div class="aplayer no-destroy" data-id="22635185" data-server="netease" data-type="song" data-fixed="false" data-autoplay="true" data-order="random" data-volume="0.5" data-mutex="true" data-listMaxHeight="36vh"> </div>

## 关于我

- **你好陌生人，我是 Asuna**
- **生于 21 世纪初的年轻武装直升机**
- **爱好：遐想，计算机，自意识 AI，潜行 MMO，漫文化，睡觉，{% hideInline 合法萝莉, 点此显示 %}**
- **喜欢~~可爱又羞涩的~~{% hideInline 女孩子！, 点此显示 %}**
- **宗教观：是个[不可知论](https://zh.wikipedia.org/zh-hans/%E4%B8%8D%E5%8F%AF%E7%9F%A5%E8%AE%BA%E8%80%85)者捏，否认人格化`神`的存在**

### 最近在沉迷什么

- **沉迷原神无法自拔，UID198060257，可以来找我玩！**
- **将 ChatGPT 调教成听话的猫娘（无端联想）...**
- **补老番，追新番，熬厕纸**

### 性格&人格

**性格类型**：[调停者 (INFP-A)](https://www.16personalities.com/ch/infp-人格?utm_source=results-assertive-mediator&utm_medium=email&utm_campaign=ch&utm_content=type-personality-0)
**个性特征**：内向型 – 74%, 直觉型 – 63%, 感受型 – 52%, 展望型 – 61%, 坚决 – 54%

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
- **本站使用 [GitHub Pages](https://pages.github.com) 作为源码托管平台**
- **主线路托管于免费的 [Vercel](https://vercel.com) 并配置自定义域名 `saop.cc` 进行中国大陆境内加速访问**
- **使用 [Hexo](https://hexo.io/zh-cn/) 博客框架与 [Butterfly](https://butterfly.js.org/) 主题作为技术支持**
- **除了域名以外，其他任何东西都没花一分钱，白嫖党的快乐！**

{% flink %}

- class_name: 博客整体布局参考
  class_desc: 博客整体布局参考以下网站~
  link_list:
  - name: Butterfly
    link: https://butterfly.js.org/
    avatar: https://butterfly.js.org/img/butterfly-icon.png
    descr: A Simple and Card UI Design theme for Hexo
  - name: Fomalhaut🥝
    link: https://www.fomal.cc/
    avatar: https://www.fomal.cc/assets/avatar.webp
    descr: Future is now 🍭🍭🍭
  - name: 空想笔记
    link: https://blog.fufu.ink/
    avatar: https://q1.qlogo.cn/g?b=qq&nk=3584155135&s=640
    descr: この世界に偶然なんてない、あるのは必然だけ

{% endflink %}
