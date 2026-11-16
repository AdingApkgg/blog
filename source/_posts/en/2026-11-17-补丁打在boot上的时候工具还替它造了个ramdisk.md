---
title: >-
  Rooting the Xiaomi 13 and Pad 6S Pro: when the patch went on boot, the tool
  even built it a ramdisk
description: >-
  Persistent root on the Xiaomi 13 and Pad 6S Pro (HyperOS 3, GKI kernel
  5.15.194): only after two rounds of "not installed" did it admit the wrong
  partition had been flashed; on GKI devices the ramdisk lives in init_boot,
  SukiSU's LKM and GKI branches, and what has to be redone on every OTA
keywords: flashing, Root, KernelSU, SukiSU, init_boot
abbrlink: 23011
permalink: en/p/23011/
lang: en
translation_of: _posts/2026-11-17-补丁打在boot上的时候工具还替它造了个ramdisk.md
source_hash: e54cbf316c28
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

Both the Xiaomi 13 and the Pad 6S Pro run GKI kernels (5.15.194); the ramdisk lives in `init_boot`, and `boot` contains only the kernel — and that is what decides which partition the patch has to go on.

The tablet came first. Unlock, flash the official 306 package back, confirm it boots normally, then install SukiSU, put the original `boot.img` into `/sdcard`, and pick "Select and patch a file" in the app.

The log had these two lines:

```text
Adding KernelSU LKM
No ramdisk, create by default
```

Flashed it, rebooted, opened SukiSU — **not installed**. `su` wasn't there either.

That line about "the tool made its own ramdisk" made the first round look like a reasonable detour: if it knew the ramdisk was missing and supplied one anyway, then maybe just wait a bit, or patch again? The second round came out exactly the same.

The real answer was in what the user said afterwards: **"Did you flash the wrong place?"**

## On GKI devices, the ramdisk isn't in boot

This is a GKI device. GKI split the kernel and the ramdisk apart: `boot` holds only the kernel, and the ramdisk has been moved to `init_boot`.

So "apply an LKM patch to boot" has no physical place to land. The tool found no ramdisk in `boot` and had to build one and stuff it in — but init never executes the one it built, so `su` is naturally empty. That `create by default` line in the log is the tool patching things up, not a sign that the structure matches.

Flashing `boot` does boot, because the kernel itself isn't broken. **"It boots" and "the patch works" are completely unrelated here**, which is exactly why it's easy to misjudge as "the tool is bad".

## The criterion isn't experience

Before changing the target, I went looking for evidence. Two sources:

- A dedicated community post, "Xiaomi phone KernelSU installation tutorial (patching init_boot.img)";
- A general guide, verbatim: "If your model has an `init_boot` partition, patch `init_boot` first; only patch `boot` when there is just an `boot` partition."

SukiSU's own docs say it automatically looks for a target partition among `boot` / `init_boot` / `vendor_boot` when patching — but what it looks for is "which file can be patched", not "where the real ramdisk in the current slot is". Feed it `boot.img` and it dutifully stuffs the result into `boot`.

So the target became `init_boot.img`, and I flashed `init_boot_a`. It worked first try: the app showed "Working".

On the phone I copied the same route, except it's on slot B: extract the contents of `_b`, patch, flash `init_boot_b`.

## Where to patch, and in what order

SukiSU's install screen has two entries that are easy to confuse:

- **Direct install**: requires the device to already be rooted; it pulls the partition from the current system itself.
- **Select and patch a file**: takes an existing `img` and patches it; no root needed.

The first time you necessarily take the second, because there's no root yet.

Don't skip the order either: **flash the stock image back first, then flash the patched one.** Patching an already-patched image stacks the patches; the stacked result installs and lights up, but you can't say which layer is doing the work, and if something breaks you can't roll it back.

## After committing

After flashing and rebooting, SukiSU shows "Working" and `su` can be obtained.

This root is not permanent insurance: **every system update kills it**. An OTA overwrites the patched `init_boot` with the official image, and the root goes with it. After updating you have to redo the whole flow: determine the current slot → pull that slot's `init_boot` from the current system → patch → flash back to the same slot.

That's also why "don't hit the system update in the first few days after getting it working": it's not that the update locks you back out, it's that it breaks the chain you just verified — and `_a`/`_b` flip along with it.

## Wrapping up

The most expensive thing this round was two wasted attempts, and both trace back to one judgment: the tool said "made you a ramdisk", so I assumed the missing piece had been supplied.

It did supply one — in the wrong place. A GKI device only recognizes the ramdisk in `init_boot`; a self-made one won't do.

Next time a tool helpfully auto-fills something that was missing, ask first: is the place it filled the same place the system actually looks?

## FAQ

**Q: After installing SukiSU it shows "not installed" and `su` isn't there either. What's going on?**
Almost always the wrong partition. On a GKI device the ramdisk is in `init_boot`; patching `boot` has no effect — the tool just builds its own ramdisk to fill in, and you still end up "not installed". Patch `init_boot.img` and flash `init_boot_a/b` instead.

**Q: Should the patch go on `boot` or `init_boot`?**
If there's an `init_boot` partition, patch `init_boot`; only patch `boot` when there's just an `boot` partition. Both the Xiaomi 13 and the Pad 6S Pro fall into the former.

**Q: Root is gone after a system update — is that normal?**
Yes, that's normal. An OTA overwrites the patched `init_boot` and restores the stock image. You have to go through the whole process again: determine the current slot → pull that slot's `init_boot` → patch it → flash it back to the same slot.

## Related

- [Xiaomi 13 (fuxi) OS3.0.309 Bootloader Unlock: Only One of Four Routes Doesn't Gamble with the Motherboard](/p/77205/)
- [After unlocking Xiaomi 13 / Pad 6S Pro: empty userdata, dual-slot abl, and the location of init_boot](/p/70289/)
- [Running KDE on Pad 6S Pro: It Works, but Accept the Cost First](/p/86020/)

<script type="application/ld+json">
{"@context":"https://schema.org","@type":"FAQPage","mainEntity":[{"@type":"Question","name":"SukiSU says Not installed after flashing and su is missing. What happened?","acceptedAnswer":{"@type":"Answer","text":"Almost always the wrong partition. On GKI devices the ramdisk lives in init_boot; patching boot does not take effect and the tool only invents a ramdisk on top. Patch init_boot.img and flash init_boot_a or init_boot_b."}},{"@type":"Question","name":"Should the patch go on boot or init_boot?","acceptedAnswer":{"@type":"Answer","text":"If there is an init_boot partition, patch init_boot; only patch boot when that is all there is. Both the Xiaomi 13 and the Pad 6S Pro belong to the former."}},{"@type":"Question","name":"Root disappears after a system update. Is that normal?","acceptedAnswer":{"@type":"Answer","text":"Yes. An OTA overwrites the patched init_boot with the official image. Redo the round: identify the current slot, pull that slot's init_boot, patch it, and flash it back to the same slot."}}]}
</script>