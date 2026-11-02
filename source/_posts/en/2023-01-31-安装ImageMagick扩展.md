---
title: Install ImageMagick Extension
description: Install ImageMagick extension for WordPress use
keywords: Deployment and Operations, ImageMagick, Windows
abbrlink: 8ba6
permalink: en/p/8ba6/
lang: en
translation_of: _posts/2023-01-31-安装ImageMagick扩展.md
source_hash: f3ac68ab4fa6
translator: ai
reviewed: false
categories:
  - Tech Development
  - Deployment & Ops
tags:
  - ImageMagick
  - Windows
copyright: false
abstract: 有东西被加密了, 请输入密码查看.
message: 您好, 这里需要密码.
theme: xray
wrong_pass_message: 抱歉, 这个密码看着不太对, 请再试试.
top_img: false
copyright_author: Anthony Bouch
date: 2023-01-31 04:00:00
updated: 2023-01-31 04:00:00
cover:
type:
comments:
sticky:
mathjax:
katex:
aside:
aplayer:
toc:
toc_number:
toc_style_simple:
copyright_author_href:
copyright_url:
copyright_info:
highlight_shrink:
password:
---

It
{% note info simple %}Reference: [神不在的星期二](https://www.imooc.com/u/6798278/bbs){% endnote %}

## Notes

In the end, I wound up writing a [博客文章](https://www.58bits.com/blog/2018/04/23/installing-imagemagick-use-php-and-iis-windows-server-2012r2-and-windows-10) — that [文章](https://stackoverflow.com/questions/46960358/how-can-i-install-imagemagick-the-oct-2017-version-for-use-from-php-in-iis-on) was a [重新发布，该帖子](https://stackoverflow.com/questions/46960358/how-can-i-install-imagemagick-the-oct-2017-version-for-use-from-php-in-iis-on) of [PhilipD](https://stackoverflow.com/users/706595/philipd) [删除的帖子](https://stackoverflow.com/questions/46960358/how-can-i-install-imagemagick-the-oct-2017-version-for-use-from-php-in-iis-on) that had been posted in the wrong format and never corrected. So the question got deleted.

I'm reposting the answer from [PhilipD](https://stackoverflow.com/users/706595/philipd) here, so that people who run into the same problem can find it more easily, since it took me half a day to find a working [博客文章](https://www.58bits.com/blog/2018/04/23/installing-imagemagick-use-php-and-iis-windows-server-2012r2-and-windows-10). These steps cover the 32-bit installation in detail. I did a 64-bit installation for my 64-bit PHP.

The server is on a Windows Server 2012R2 (64-bit) machine, using IIS as the web server application. However, I installed the 32-bit versions of all ImageMagick-related software, because the web server application (IIS) is 32-bit. The following shows the latest / most recent versions as of October 2017.

## Download the ImageMagick installer

Go to http://www.imagemagick.org/

Click "Download" in the menu bar

Then either "[Windows Binary Releases](http://www.imagemagick.org/script/download.php#windows)" in the top links, or scroll down

Select "Win32 dynamic 16 bits-per-pixel"; be sure to choose the dynamic components rather than the static ones.

## Download the PHP module for ImageMagick

Go to http://windows.php.net/downloads/pecl/releases/imagick/

Choose the highest version that isn't an "RC" (release candidate) build — currently 3.4.3

Choose the entry for the PHP (7.1) version that is "NTS" (non-thread-safe), for VC14, x86 and IIS

Download and save the ZIP file.

## Download PHP's dependency packages for loading / using ImageMagick

Go to http://windows.php.net/downloads/pecl/deps/

Choose the "ImageMagick" package with the highest version number

\* Note that this version may differ from the one in (1.) above

Choose the "vc14" and "x86" versions \*

## Unblock each downloaded file

Depending on how you downloaded them, this may or may not be necessary, but it's always worth checking and "unblocking" downloaded files if needed.

Right-click each file and choose "Properties" from the pop-up menu

If the Properties dialog shows the text "This file came from another computer and might be blocked to help protect this computer",

click the "Unblock" button

Click OK.

If you don't "unblock" the downloaded files — especially ZIP files — the individual files you install or copy can still be marked as "blocked", which sometimes causes odd problems when running the software.

## Install the ImageMagick application

Run ImageMagick-7.0.7-8-Q16-x86-dll.exe as administrator to install it

Accept the license agreement

Accept the default settings on every screen of the installation.

After installation, to test whether it succeeded, open a command prompt and run the following two commands:

**magick wizard: wizard.jpg**
**magick wizard.jpg win:**
This displays an "IMDisplay" window showing the wizard's sketch / image of creating the Mona Lisa portrait on an easel.

## Install the dependencies

Extract the file you downloaded in step 3.

Go into the bin directory

Copy the **IM*MOD_RL*\*.dll** files (125 files) into the folder of the installed ImageMagick version, e.g. **C:\Program Files (x86)\ImageMagick-7.0.7-Q16**

Go back to the bin directory

Copy the **CORE*RL*\*.dll** files (20 files) into the folder of the installed ImageMagick version, e.g. **C:\Program Files (x86)\ImageMagick-7.0.7-Q16\*** \* When prompted to overwrite / rename, choose "Overwrite"

Note that this will break the command-line version of Imagick. magick: Wrong JPEG library version: library is 80, caller expects 62

## Install the Imagick PHP extension DLL

Extract the file downloaded in step 2.

Copy the **php_imagick.dll** file into the "ext" folder of the installed PHP version on the server, e.g. **C:\php\7.1\ext**.

Do not copy the **CORE*RL* \*** files

In some articles on the web, you'll see instructions to also copy the CORE*RL* \* files from that toolkit in order to replace the files in the ImageMagick folder, but that's incorrect. The appropriate versions of those files were copied in step 6.

## Modify PHP.ini

Edit the php.ini file in the PHP software folder, e.g. "C:\PHP\7.1\php.ini"

Add the following line to the section that contains the other extensions:

**extension=php_imagick.dll**

## Restart the server.

Restarting IIS alone doesn't seem to be enough; you need to restart the whole machine. This may have to do with IIS not recognizing the PATH entries that Imagick requires.

## Test with PHPINFO

Create a PHP file in the web root containing the following:

Visit this file in a web browser,

search for the "Imagick" section that should now be present in the PHPINFO output.

It should look like this:

```markdown
imagick imagick 模块：启用了 imagick 模块版本 3.4.3
imagick 类 Imagick，ImagickDraw，ImagickPixel，ImagickPixelIterator，ImagickKernel
Imagick 使用 ImageMagick 版本 ImageMagick 编译的版本 6.9.3-7 Q16 x86 2016-03-27 http://www.imagemagick.org
Imagick 使用 ImageMagick 库版本 ImageMagick 6.9.3-7 Q16 x86 2016-03-27 http://www.imagemagick.org
ImageMagick 版权所有（C）1999-2015 ImageMagick Studio LLC
ImageMagick 发布日期 2016-03-27
ImageMagick 支持的数量格式：216
ImageMagick 支持的格式 3FR，AAI，AI，ART，ARW，AVI，AVS，BGR，BGRA，BGRO，BIE，BMP，BMP2，BMP3，BRF，CAL，CALS，CANVAS，CAPTION，CIN，CIP，CLIP，CLIPBOARD，CMYK ，CMYKA，CR2，CRW，CUR，剪切，数据，DCM，DCR，DCX，DDS，DFONT，DJVU，DNG，DOT，DPS，DPX，DXT1，DXT5，EMF，EPDF，EPI，EPS，EPS2，EPS3，EPSF ，EPSI，EPT，EPT2，EPT3，ERF，EXR，传真，FITS，FPX，分形，FTS，G3，GIF，GIF87，梯度，灰色，GROUP4，GV，H，HALD，HDR，直方图，HRZ，HTM，HTML ，ICB，ICO，ICON，IIQ，INFO，INLINE，IPL，ISOBRL，ISOBRL6，J2C，J2K，JBG，JBIG，JNX，JP2，JPC，JPM，JPT，JSON，K25，KDC，LABEL，M2V，M4V，MAC ，MAGICK，MAP，MASK，MAT，MATTE，MEF，MIFF，MKV，MONO，MOV，MP4，MPC，MPEG，MPG，MRW，MSL，MTV，MVG，NEF，NRW，NULL，ORF，OTB，OTF，PAL ，PALM，PAM，PATTERN，PBM，PCD，PCDS，PCL，PCT，PCX，PDB，PDF，PDFA，PEF，PES，PFA，PFB，PFM，PGM，PICON，PICT，PIX，PLASMA，PNM，PPM，预览，PS，PS2，PS3，PSB，PSD，PTIF，PWP，径向梯度，RAF，RAS，RAW，RGB，RGBA，RGBO，RGF，RLA，RLE，RMF，RW2，SCR，SCREENSHOT，SCT， SFW，SGI，SHTML，SIX，SIXEL，稀疏颜色，SR2，SRF，STEGANO，SUN，TEXT，TGA，THUMBNAIL，TIFF，TIFF64，TILE，TIM，TTC，TTF，TXT，UBT，UBRL6，UIL，UYVY， VDA，VICAR，VID，VIFF，VIPS，VST，WBMP，WEBP，WMF，WMV，WPG，X3F，XBM，XC，XCF，XPM，XPS，XV，YCbCr，YCbCrA，YUV
```

**Important note:**
If the "Supported formats" section shows no formats, or only a few, the most likely cause is that you missed copying one or more IM*MOD_RL* _ or CORE*RL* _ DLL files into the ImageMagick folder, or you copied them from the "php_magick" toolkit.

## Test image generation with ImageMagick in PHP

Create a PHP file in the web root containing the following (I copied this from one of the answers to "Verify ImageMagick installation"):

```php
<?php

error_reporting(E_ALL);

ini_set( 'display_errors','1');

/* Create a new imagick object */

$im = new Imagick();

/* Create new image. This will be used as fill pattern */

$im->newPseudoImage(50, 50, "gradient:red-black");

/* Create imagickdraw object */

$draw = new ImagickDraw();

/* Start a new pattern called "gradient" */

$draw->pushPattern('gradient', 0, 0, 50, 50);

/* Composite the gradient on the pattern */

$draw->composite(Imagick::COMPOSITE_OVER, 0, 0, 50, 50, $im);

/* Close the pattern */

$draw->popPattern();

/* Use the pattern called "gradient" as the fill */

$draw->setFillPatternURL('#gradient');

/* Set font size to 52 */

$draw->setFontSize(52);

/* Annotate some text */

$draw->annotation(20, 50, "Hello World!");

/* Create a new canvas object and a white image */

$canvas = new Imagick();

$canvas->newImage(350, 70, "white");

/* Draw the ImagickDraw on to the canvas */

$canvas->drawImage($draw);

/* 1px black border around the image */

$canvas->borderImage('black', 1, 1);

/* Set the format to PNG */

$canvas->setImageFormat('png');

/* Output the image */

header("Content-Type: image/png");

echo $canvas;

?>
```

Run this PHP file in the browser. It should display an image containing the text "Hello World!"

## Check for errors

Check the php-errors.log file for any errors.

You can find where the php-errors.log file is defined in the php.ini file. Check this file for the most recent errors related to the ImageMagick installation.

## PDF files require Ghostscript
(This is part 1 of 2 of the same post.)

After installing and completing all of the above, ImageMagick can be used in PHP to convert images, but not to convert PDF files into images. For this last step, it also seems necessary to install Ghostscript from https://www.ghostscript.com/download/gsdnld.html, and it only worked for me once I had installed the 64-bit version of Ghostscript (even though everything else I had installed was 32-bit). Simply installing Ghostscript is enough. No changes to php.ini or any other configuration are needed.