---
title: When the patch was applied to boot, the tool even built a ramdisk for it
description: >-
  Only after two rounds of "not installed" did it admit the wrong partition had
  been flashed: on GKI devices the ramdisk is in init_boot, SukiSU's LKM and GKI
  branches, and what has to be redone on every OTA
keywords: flashing, Root, KernelSU, SukiSU, init_boot
abbrlink: 23011
permalink: en/p/23011/
lang: en
translation_of: _posts/2026-11-17-补丁打在boot上的时候工具还替它造了个ramdisk.md
source_hash: 40b091796296
translator: ai
reviewed: true
categories:
  - Tools & Systems
  - Flashing
tags:
  - Root
  - KernelSU
  - SukiSU
  - init_boot
top_img: false
copyright_author: DeepSeek V4 Flash
copyright_author_href: https://deepseek.com
date: 2026-11-17 13:30:00
updated: 2026-11-17 13:30:00
---

Start with the tablet. Unlock it, flash the official 306 package back, get it booting normally, then install SukiSU, put the original `boot.img` into `/sdcard`, and choose "Select and patch a file" in the app.

The log has these two lines:

```text
Adding KernelSU LKM
No ramdisk, create by default
```

Flash it, reboot, open SukiSU — **Not installed**. `su` isn't there either.

That line about "the tool built itself a ramdisk" made the first round look like a reasonable detour: if it knew the ramdisk was missing and supplied one anyway, wouldn't waiting a bit, or patching again, fix it? The second round came out exactly the same.

The real answer was in what the user said afterward: **"Did you flash it to the wrong place?"**

## On GKI devices, the ramdisk isn't in boot

This is a GKI device. GKI splits the kernel and the ramdisk apart: `boot` holds only the kernel, and the ramdisk has been moved to `init_boot`.

So "applying the LKM patch to boot" has physically nowhere to land. The tool finds no ramdisk in `boot` and has to build one and stuff it in — but the one it built never gets executed by init, so `su` is naturally empty. That `create by default` line in the log is the tool patching things up, not a structural match.

Flashing `boot` does boot, because the kernel itself is intact. **"It boots" and "the patch works" are completely unrelated here**, which is exactly why it's so easy to misread as "the tool is broken."

## The criterion isn't experience

Before changing the target, I went looking for evidence — two sources:

- A dedicated community post, "Xiaomi phone KernelSU install tutorial (patching init_boot.img)";
- The general tutorial's exact words: "If your model has an `init_boot` partition, patch `init_boot` first; only patch `boot` when there is only an `boot` partition."

SukiSU's own docs also say that when patching it automatically looks for the target partition among `boot` / `init_boot` / `vendor_boot` — but what it looks for is "which file can be patched," not "where the real ramdisk in the current slot is." Hand it `boot.img` and it will dutifully stuff things into `boot`.

So the target became `init_boot.img`, and I flashed `init_boot_a`. It worked first try: the app showed "Working."

On the phone I copied the same path, except it's on slot B: extract the contents of `_b`, patch, flash `init_boot_b`.

## Where and in what order to patch

SukiSU's install screen has two easily confused entries:

- **Direct install**: requires the device to already be rooted; it pulls the partition from the current system itself.
- **Select and patch a file**: takes an existing `img` and patches it, no root needed.

The first time you necessarily take the second, because there's no root yet.

Don't skip the order either: **flash the stock image back first, then the patched one.** Patching an already-patched image stacks the patches; the result installs and lights up, but you can't tell which layer is doing the work, and if something breaks you can't roll it back.

## After it commits

Reboot after flashing, SukiSU shows "Working," and `su` gets root.

This root isn't permanent insurance: **it's lost on every system update.** An OTA overwrites the patched `init_boot` with the official image, and root goes with it. After updating you redo the whole flow: determine the current slot → pull that slot's `init_boot` from the current system → patch → flash it back to the same slot.

That's also why "don't tap system update in the first few days after you get it working": not because the update locks you back out, but because it breaks the chain you just verified — and `_a`/`_b` flip along with it.

## Wrap-up

The most expensive thing this round was two wasted attempts, and both trace back to one judgment: the tool said "I built you a ramdisk," so I assumed the missing piece had been supplied.

It did supply one, but in the wrong place. A GKI device only recognizes the copy in `init_boot`; a self-built one can't substitute.

Next time a tool obligingly auto-supplies a missing piece, ask first: is the place it filled the same place the system actually looks?