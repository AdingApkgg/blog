---
title: Empty userdata, dual-slot abl, and the location of init_boot
description: >-
  Three blockers after unlocking, and how to actually determine "which partition
  to flash": A/B slots, boot vs. init_boot, and workarounds for unsupported
  fastboot fetch
keywords: flashing, fastboot, partition, init_boot, recovery
abbrlink: 70289
permalink: en/p/70289/
lang: en
translation_of: _posts/2026-11-17-空userdata双槽abl和init_boot的位置.md
source_hash: 3a7818580d25
translator: ai
reviewed: false
categories:
  - Tools & Systems
  - Flashing
tags:
  - fastboot
  - Partition
  - init_boot
  - Recovery
top_img: false
copyright_author: DeepSeek V4 Flash
copyright_author_href: https://deepseek.com
date: 2026-11-17 12:55:00
updated: 2026-11-17 12:55:00
---

Once the unlock step was done, there was an orange warning on screen, a five-second wait, and then the system booted. Up to here everything was normal.

Then the problems started. This post is about three sticking points, and what they have in common is that **the error message points somewhere other than the real cause**.

## "Couldn't mount file system" doesn't mean the system flash failed

Unlocking wipes data, so the data partition is empty and its filesystem hasn't been created yet. The red text at the bottom the first time you enter recovery is `Couldn't mount file system`.

It's easy to misread this as a corrupted system flash and go back to reflash system. You don't need to: system is fine; what's missing is formatting of data.

The fix is to use the volume keys to select `Wipe Data` (some recoveries call it `Format Data` / `Factory Reset`), confirm with the power button, confirm once more, then `Reboot to system`. The first boot takes several minutes.

Two things about the order to remember:

- **Format after flashing the system**, not before — the flashing process may touch data again.
- Don't leave the image directory you copied over in `sdcard`; formatting will wipe it too.

## Dual slots: writing only one leaves trouble behind

This device's `abl` has two slots, `_a` and `_b`.

If you only write the engineering abl to `abl_a`, `abl_b` stays the stock version. While the default slot is A you can't tell the difference; once the bootloader switches to B, the loading logic of the two slots is no longer the same thing.

The tool writes both by default, and so should you when typing by hand: write both, then `sync`. Before writing, `ls` once to confirm the file is there.

The same reasoning applies to every later "dd into a partition" operation: **after writing you must verify the current slot**. A/B slots are not a "backup"; they're two machines taking turns, and you've only fixed one.

## "Slot A is empty after the OTA"

This is the hardest one, because it steps on three things at once.

The system update switched boot to slot B, so you have to extract `init_boot` **from the current system** to patch it. There appear to be two ways to extract it, and neither works:

- `fastboot fetch`: this bootloader doesn't support it, and it errors with `Device does not support fetch command`.
- `adb shell dd if=/dev/block/by-name/init_boot of=/sdcard/...`: the shell isn't in the `disk` group, so it reads back as 0 bytes.

So only two proper routes remain: download the full 6 GB official package and extract it, or get temporary root again and use root privileges to `dd` the contents of the current slot. The latter avoids the huge download, at the cost of running the whole temporary-root routine again — and after that you have to reboot back to a clean state before patching.

Here's a judgment call that has to be nailed down: **the current system is on slot B, what you extracted is the contents of `_b`, and the patch must be flashed to `init_boot_b`**. Flashing to `_a` gives no warning at all; it simply doesn't take effect.

## boot or init_boot

The same question gets two different answers on phones, because it depends on whether the model has a separate partition.

The criterion is general, not rule of thumb:

> If your device has a `init_boot` partition, patch `init_boot` first; only patch `boot` when there is just a `boot` partition.

Both devices have `init_boot`. The phone, like this tablet, is a GKI device — the ramdisk lives in `init_boot`, and `boot` holds only the kernel.

This structure determines "where to patch": flashing `boot` still boots and still lights up, because the kernel isn't broken; but the patch has to be loaded by the init hook in the ramdisk, so patching `boot` just stuffs the image somewhere with no hook, and the symptom is that it still shows "not installed" after installing. Both devices wasted two rounds each on this (more on that in the next post).

## Two commands to confirm the state

A more reliable check than "looks fine now":

```sh
adb shell getprop ro.boot.verifiedbootstate   # orange = 已解锁
adb shell getprop ro.boot.flash.locked        # 0 = 未锁
adb shell getprop sys.boot_completed          # 1 = 已正常开机
```

For the version, don't look at the "Unlocked" line in the settings page; look at `ro.build.display.id` or the full version number in settings.

## Wrapping up

All three sticking points come back to the same sentence: **first figure out which slot you're on and which partition you need to touch, then decide which command to use.**

`Couldn't mount file system` looks like a broken system, dual slots look like "it writes both anyway", and `fastboot fetch` looks like "a one-command job". The shared consequence of all three illusions is turning a five-minute operation into a full reflash.

One more thing that isn't technical but matters just as much: **don't tap system update** for several days after unlocking and flashing. An OTA overwrites the patch, switches slots, flips the slot you just figured out all over again, and a major version will scramble methods you've already verified.