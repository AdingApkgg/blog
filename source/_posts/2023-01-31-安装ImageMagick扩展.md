---
title: 安装 ImageMagick 扩展
description: 安装ImageMagick扩展以供WP使用
copyright: false
abstract: 有东西被加密了, 请输入密码查看.
message: 您好, 这里需要密码.
theme: xray
wrong_pass_message: 抱歉, 这个密码看着不太对, 请再试试.
wrong_hash_message: 抱歉, 这个文章不能被校验, 不过您还是能看看解密后的内容.
abbrlink: 8ba6
top_img: false
copyright_author: Anthony Bouch
categories:
  - 软件安装
tags:
  - ImageMagick
  - PHP扩展
  - Windows Server
  - IIS
keywords: 软件安装, ImageMagick, PHP扩展, Windows Server, IIS
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

{% note info simple %}参考：[神不在的星期二](https://www.imooc.com/u/6798278/bbs){% endnote %}

## 说明

最终，我最终写了一个[博客文章](https://www.58bits.com/blog/2018/04/23/installing-imagemagick-use-php-and-iis-windows-server-2012r2-and-windows-10)，该[文章](https://stackoverflow.com/questions/46960358/how-can-i-install-imagemagick-the-oct-2017-version-for-use-from-php-in-iis-on)是 [PhilipD](https://stackoverflow.com/users/706595/philipd) [删除的帖子](https://stackoverflow.com/questions/46960358/how-can-i-install-imagemagick-the-oct-2017-version-for-use-from-php-in-iis-on)的[重新发布，该帖子](https://stackoverflow.com/questions/46960358/how-can-i-install-imagemagick-the-oct-2017-version-for-use-from-php-in-iis-on)以错误的格式发布且未得到更正。所以问题被删除了。

我在这里重新发布 [PhilipD](https://stackoverflow.com/users/706595/philipd) 的答案，这样可以使遇到相同问题的人更容易找到它，因为花了半天的时间才找到有效的[博客文章](https://www.58bits.com/blog/2018/04/23/installing-imagemagick-use-php-and-iis-windows-server-2012r2-and-windows-10)。这些步骤详细介绍了 32 位安装。我为我的 64 位 php 执行了 64 位安装。

该服务器位于 Windows Server 2012R2（64 位）服务器上，使用 IIS 作为 Web 服务器应用程序。但是，我安装了所有与 ImageMagick 相关的软件的 32 位版本，因为 Web 服务器应用程序（IIS）是 32 位的。以下显示了截至 2017 年 10 月的最新 / 最新版本。

## 下载 ImageMagick 安装程序

前往 http://www.imagemagick.org/

点击菜单栏中的 “下载”

然后，顶部链接中的 “ [Windows Binary Releases](http://www.imagemagick.org/script/download.php#windows) ” 或向下滚动

选择 “Win32 动态像素每像素 16 位”，请确保选择动态组件而不是静态组件。

## 下载用于 ImageMagick 的 php 模块

转到 http://windows.php.net/downloads/pecl/releases/imagick/

选择不是 “RC”（发行候选）版本的最高版本–当前为 3.4.3

选择用于 VC14，x86 和 IIS 的 “NTS”（非线程安全）的 PHP（7.1）版本的条目

下载并保存 ZIP 文件。

## 下载 PHP 的依赖包，以加载 / 使用 ImageMagick

转到 http://windows.php.net/downloads/pecl/deps/

选择具有最高版本号的 “ImageMagick” 程序包

\* 请注意，该版本可能与上述（1.）中的版本不同

选择 “vc14” 和 “ x86” 版本 \*

## 取消阻止每个下载的文件

根据下载方式的不同，这可能有必要，也可能没有必要，但是如果需要，应始终检查并 “取消阻止” 下载的文件。

右键单击每个文件，然后从弹出菜单中选择 “属性”

如果属性对话框显示文本 “此文件来自另一台计算机，可能被阻止以帮助保护此计算机”，

点击 “取消阻止” 按钮

单击确定。

如果您不 “取消阻止” 下载的文件，尤其是 ZIP 文件，则仍可以将已安装或复制的单个文件标记为 “阻止”，这有时会在运行软件时引起一些奇怪的问题。

## 安装 Imagick 应用程序

以管理员身份运行 ImageMagick-7.0.7-8-Q16-x86-dll.exe 进行安装

接受许可协议

在安装过程中的每个屏幕上接受默认设置。

安装完成后，要测试安装是否成功，请打开命令提示符并运行以下两个命令：

**magick wizard: wizard.jpg**
**magick wizard.jpg win:**
这将显示一个 “IMDisplay” 窗口，该窗口显示在画架上创建蒙娜丽莎肖像的向导的素描 / 图像。

## 安装依赖项

解压缩您在步骤 3 中下载的文件。

进入 bin 目录

将 **IM*MOD_RL*\*.dll** 文件（125 个文件）复制到 ImageMagick 的已安装版本的文件夹中，例如 **C:\Program Files (x86)\ImageMagick-7.0.7-Q16**

返回到 bin 目录

将 **CORE*RL*\*.dll** 文件（20 个文件）复制到 ImageMagick 的已安装版本的文件夹中，例如 **C:\Program Files (x86)\ImageMagick-7.0.7-Q16\*** \* 在提示您要覆盖 / 重命名的情况下，选择 “覆盖”

请注意，这将破坏 Imagick 的命令版本。magick：错误的 JPEG 库版本：库为 80，呼叫者期望为 62

## 安装 Imagick php 扩展 dll

解压在步骤 2 中下载的文件。

将文件复制 **php_imagick.dll** 到服务器上已安装版本的 PHP 的 “ext” 文件夹中，例如 **C:\php\7.1\ext**。

不要复制 **CORE*RL* \*** 文件

在 Web 上的某些文章中，您将看到也从该工具包复制 CORE*RL* \* 文件以替换 ImageMagick 文件夹中的文件的说明，但这是不正确的。在步骤 6 中复制了这些文件的适当版本。

## 修改 PHP.ini

编辑 PHP 软件文件夹中的 php.ini 文件，例如 “C：\ PHP \ 7.1 \ php.ini”

将以下行添加到包含其他扩展名的部分：

**extension=php_imagick.dll**

## 重新启动服务器。

重新启动 IIS 似乎还不够，您需要重新启动整个计算机。这可能与 IIS 无法识别 Imagick 输入的 PATH 条目有关。

## 测试 PHPINFO

在 Web 根目录中创建一个 PHP 文件，其中包含以下内容：

在网络浏览器中访问此文件，

搜索现在应该存在于 PHPINFO 输出中的 “Imagick” 部分。

它应如下所示：

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

**重要说明：**
如果 “受支持的格式” 部分未显示任何格式，或仅显示了少量格式，则最可能的原因是您错过了将一个或多个 IM*MOD_RL* _ 或 CORE*RL* _ DLL 文件复制到 ImageMagick 文件夹中的操作，或者您从 “ php_magick” 工具包中复制了它们。

## 在 PHP 中使用 ImageMagick 测试图像生成

在 Web 根目录中创建一个 PHP 文件，其中包含以下内容（我从 “验证 ImageMagick 安装” 此项中的一项输入中复制了该文件）：

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

在浏览器中运行此 PHP 文件。它应该显示一个包含文本 “Hello World！” 的图像。

## 检查错误

检查 php-errors.log 文件是否有任何错误。

您可以在 php.ini 文件中找到 php-errors.log 文件的定义位置。检查此文件中是否有与 ImageMagick 安装相关的最新错误。

## PDF 文件需要 Ghostscript

安装并完成上述所有操作后，ImageMagick 可以在 PHP 中用于转换图像，但不能用于将 PDF 文件转换为图像。对于最后一步，似乎也有必要从 https://www.ghostscript.com/download/gsdnld.html 安装 Ghostscript，并且只有在我安装了 64 位版本的 Ghostscript 的情况下，它才能正常工作（即使一切否则我安装的是 32 位版本）。仅需安装 Ghostscript。无需更改 php.ini 或任何其他配置。
