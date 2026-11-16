---
title: >-
  After unlocking Xiaomi 13 / Pad 6S Pro: empty userdata, dual-slot abl, and the
  location of init_boot
description: >-
  Three blockers after unlocking the Xiaomi 13 and Pad 6S Pro (HyperOS 3, 309 /
  306), and how to actually determine "which partition to flash": A/B slots,
  boot vs. init_boot, and workarounds for fastboot fetch not being supported
keywords: flashing, fastboot, partition, init_boot, recovery
abbrlink: 70289
permalink: en/p/70289/
lang: en
translation_of: _posts/2026-11-17-空userdata双槽abl和init_boot的位置.md
source_hash: e73f5b2c361b
translator: ai
reviewed: true
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

Both devices run HyperOS 3 (309 on the Xiaomi 13, 306 on the Pad 6S Pro). Once the unlock step is done, the screen shows an orange warning, a five-second wait, and then it boots into the system. Up to here everything is normal.

Then the problems start. This post documents three sticking points, and what they share is this: **the error message points somewhere other than the real cause**.

## "Couldn't mount file system" doesn't mean the system flash failed

Unlocking wipes data, so the data partition is empty and no filesystem has been created yet. The red text at the bottom the first time you enter recovery is exactly `Couldn't mount file system`.

It's easy to misread this as a corrupted system flash and go back to reflash system. You don't need to: system is fine, what's missing is formatting data.

The fix is to use the volume keys to select `Wipe Data` (some recoveries call it `Format Data` / `Factory Reset`), confirm with the power button, confirm once more, then `Reboot to system`. The first boot takes several minutes.

Two things about the order are worth remembering:

- **Format after flashing the system**, not before — the flashing process may touch data again.
- Don't leave the image directory you copied over in `sdcard`; formatting wipes it too.

## Dual slots: writing only one leaves trouble behind

The `abl` on this device has two slots, `_a` and `_b`.

If you only write `abl_a` with the engineering abl, `abl_b` stays on the stock version. While the default slot is A you can't tell the difference; the moment boot switches to B, the two slots no longer load the same way.

The tool writes both by default, and so should you if typing by hand: write both, then `sync` at the end. Before writing, `ls` to confirm the file is there.

The same logic applies to every later "dd into a partition" operation: **after writing, always verify the current slot**. A/B slots aren't a "backup" — they're two machines taking turns, and you've only fixed one.

## "After the OTA, slot A is empty"

This is the hardest one, because it trips over three things at once.

The system update switched boot to slot B, so you have to extract `init_boot` **from the running system** to patch it. There appear to be two ways to extract it, and neither works:

- `fastboot fetch`: this bootloader doesn't support it, and it errors out with `Device does not support fetch command`.
- `adb shell dd if=/dev/block/by-name/init_boot of=/sdcard/...`: the shell isn't in the `disk` group, so it reads back as 0 bytes.

That leaves two legitimate routes: download the full 6 GB official package and extract it, or get temporary root again and use root privileges to `dd` the contents of the current slot. The latter avoids the huge download, at the cost of running the whole temporary-root routine again — and after that you have to reboot back to a clean state before patching.

Here's a rule you have to nail down: **the running system is on slot B, you extracted the contents of `_b`, so the patch must be flashed to `init_boot_b`**. Flashing to `_a` gives no warning at all — it just doesn't take effect.

## boot or init_boot

The same question gets two different answers on phones, because it depends on whether the model has a separate partition.

The criterion is general, not a rule of thumb:

> If your device has a `init_boot` partition, patch `init_boot` first; only patch `boot` when all you have is a `boot` partition.

Both devices have `init_boot`. The phone, like this tablet, is a GKI device — the ramdisk lives in `init_boot`, and `boot` holds nothing but the kernel.

That structure decides "where to patch": flashing `boot` still lights up and still boots, because the kernel isn't broken; but the patch has to be loaded by the init hook in the ramdisk, so patching `boot` just stuffs the image somewhere with no hook, and the symptom is that it still says "not installed" after installing. Both devices wasted two rounds each on this (more in the next post).

## Two commands to confirm the state

A more reliable check than "looks fine now":

```sh
adb shell getprop ro.boot.verifiedbootstate   # orange = unlocked
adb shell getprop ro.boot.flash.locked        # 0 = not locked
adb shell getprop sys.boot_completed          # 1 = 已正常开机
```

Don't check the version against the "Unlocked" line in the settings page; check `ro.build.display.id` or the full version number in settings.

## Wrapping up

All three sticking points come back to the same sentence: **first work out which slot you're on and which partition you're touching, then decide which command to use.**

`Couldn't mount file system` looks like a broken system, dual slots look like "it writes both anyway", and `fastboot fetch` looks like "one command, done". The shared consequence of all three illusions is turning a five-minute operation into a full reflash.

One more point, not technical but just as important: for several days after unlocking and flashing, **don't tap the system update**. An OTA overwrites the patch, switches slots, flips the slot you just figured out all over again, and a major version will scramble methods you've already verified.

## FAQ

**Q: After unlocking, recovery shows `Couldn't mount file system` — did the system flash fail?**
No. Unlocking wiped data and no filesystem has been created yet. Use the volume keys to select `Wipe Data`, format data, and reboot; system is fine.

**Q: Do I need to flash both `abl_a` and `abl_b`?**
Yes, both. Write only one slot and the other stays stock; once boot switches slots after unlocking, you'll hit inconsistent boot logic between the two.

(This is part 1 of 2 of the same post.)

**Q: `fastboot fetch` isn't supported — how do I extract the `init_boot` from the current slot?**
Two options: download the full 6 GB official fastboot ROM and extract it, or get temporary root again and use root privileges to `dd` the contents of the current slot. Once you've extracted it, make sure to flash it back to the same slot.

## Related

- [Xiaomi 13 (fuxi) OS3.0.309 Bootloader Unlock: Only One of Four Routes Doesn't Gamble with the Motherboard](/p/77205/)
- [Rooting the Xiaomi 13 and Pad 6S Pro: when the patch went on boot, the tool even built it a ramdisk](/p/23011/)
- [Running KDE on Pad 6S Pro: It Works, but Accept the Cost First](/p/86020/)

<script type="application/ld+json">
{"@context":"https://schema.org","@type":"FAQPage","mainEntity":[{"@type":"Question","name":"Recovery says Couldn't mount file system after unlocking. Did the system flash fail?","acceptedAnswer":{"@type":"Answer","text":"No. Unlocking wiped data and the filesystem has not been created yet. Select Wipe Data with the volume keys to format data, then reboot; system is fine."}},{"@type":"Question","name":"Do I need to write both abl_a and abl_b?","acceptedAnswer":{"@type":"Answer","text":"Yes. Write only one slot and the other stays official, so switching slots after unlocking hits an inconsistent bootloader."}},{"@type":"Question","name":"fastboot fetch is not supported. How do I extract the current slot's init_boot?","acceptedAnswer":{"@type":"Answer","text":"Two ways: unpack the full 6 GB official card-flash package, or take a temporary root again and dd the current slot under root. Always flash the patch back to the same slot."}}]}
</script>

(This is part 2 of 2 of the same post.)