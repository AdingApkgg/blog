---
title: 空 userdata、双槽 abl 和 init_boot 的位置
description: 解锁之后的三个卡点，以及「刷哪个分区」这件事到底怎么判断：A/B 槽、boot 与 init_boot、fastboot fetch 不支持的绕法
top_img: false
copyright_author: DeepSeek V4 Flash
copyright_author_href: https://deepseek.com
keywords: 刷机, fastboot, 分区, init_boot, 恢复
abbrlink: 70289
categories:
  - 工具与系统
  - 刷机
tags:
  - fastboot
  - 分区
  - init_boot
  - 恢复
date: 2026-11-17 12:55:00
updated: 2026-11-17 12:55:00
---

解锁那一步做完，屏幕上是橙色警告，五秒等待，然后进系统。到这儿一切正常。

问题接着就来。这一篇记的是三个卡点，它们的共同点是：**报错信息指的方向和真正的原因不一样**。

## 「Couldn't mount file system」不是系统没刷好

解锁会清 data，所以 data 分区是空的、文件系统还没建。第一次进 recovery 时底部红字就是 `Couldn't mount file system`。

容易误判成 system 刷坏了，然后回去重刷一遍 system。其实不用：system 是好的，缺的是 data 的格式化。

处置是用音量键选 `Wipe Data`（有的 recovery 叫 `Format Data` / `Factory Reset`），电源键确认，再选一次确认，然后 `Reboot to system`。首次开机要几分钟。

顺序上有两条要记住：

- **格式化放在刷完系统之后**，别在刷之前——刷机过程可能再动 data。
- 拷进去的镜像目录别留在 `sdcard`，格式化会一起清掉。

## 双槽：只写一个是留后患

这台机器的 `abl` 有 `_a`、`_b` 两个槽。

工程 abl 只写 `abl_a` 的话，`abl_b` 还是官方版本。默认槽是 A 的时候看不出区别，一旦引导切到 B，两个槽的加载逻辑就不是一回事了。

工具默认会写两条，手敲也一样，两条都写、最后 `sync`。写之前 `ls` 一下确认文件在。

同样的道理适用于后续所有「往分区里 dd」的操作：**写完必须核当前槽**。A/B 槽不是「备份」，是两台轮换的机器，你只修了一台。

## 「OTA 之后 A 槽是空的」

这是最难的一处，因为它同时踩了三个东西。

系统更新把启动切到了 B 槽，于是要从**当前系统里**把 `init_boot` 抠出来打补丁。抠的方法看起来有两条，都不通：

- `fastboot fetch`：这台 bootloader 不支持，报 `Device does not support fetch command`。
- `adb shell dd if=/dev/block/by-name/init_boot of=/sdcard/...`：shell 不在 `disk` 组，读出来是 0 字节。

于是只剩两条正路：下 6 GB 的完整官方包解出来，或者再拿一次临时 root、用 root 权限 `dd` 出当前槽的内容。后者不用下那么大的包，代价是要把临时 root 那套完整再跑一遍——而且跑完得重启回干净态，再打补丁。

这里有个必须写死的判断：**当前系统在 B 槽，抠的是 `_b` 的内容，补丁也必须刷进 `init_boot_b`**。刷到 `_a` 不会有任何提示，只是不生效。

## boot 还是 init_boot

同一个问题在手机上出现两种答案，因为它取决于机型有没有独立分区。

判据是通用的，不是经验：

> 如果你的机器有 `init_boot` 分区，就优先修 `init_boot`；只有 `boot` 分区时才修 `boot`。

两台机器都有 `init_boot`。手机和这台平板一样是 GKI 设备——ramdisk 在 `init_boot` 里，`boot` 只剩内核。

这个结构决定了「打在哪」：刷 `boot` 也能亮、也能开机，因为内核没坏；但补丁要靠 ramdisk 里的 init 钩子加载，打在 `boot` 上只是把镜像塞进了没有钩子的地方，现象是装完照样显示「未安装」。两台都在这上面各浪费了两轮（下一篇细说）。

## 确认状态的两条命令

比「看起来好了」可靠的判断：

```sh
adb shell getprop ro.boot.verifiedbootstate   # orange = 已解锁
adb shell getprop ro.boot.flash.locked        # 0 = 未锁
adb shell getprop sys.boot_completed          # 1 = 已正常开机
```

版本对不看设置页里的「已解锁」那一行，看 `ro.build.display.id` 或设置里的完整版本号。

## 收尾

三个卡点最后都回到同一句：**先弄清现在在哪个槽、要动哪个分区，再决定用哪条命令。**

`Couldn't mount file system` 长得像坏系统，双槽长得像「反正会一起写」，`fastboot fetch` 长得像「一条命令的事」。三个假象的共同后果都是把一次五分钟的操作变成一次重刷。

还有一条不在技术上但同样重要：解锁、刷完好几天之内**别点系统更新**。OTA 会覆盖补丁、切槽、把刚摸清的槽位再翻一遍，而且大版本还会把已经验证过的方法搅乱。
