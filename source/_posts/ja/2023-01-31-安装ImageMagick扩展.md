---
title: ImageMagick 拡張機能のインストール
description: WordPress で使用するために ImageMagick 拡張機能をインストールする
keywords: デプロイと運用, ImageMagick, Windows
abbrlink: 8ba6
permalink: ja/p/8ba6/
lang: ja
translation_of: _posts/2023-01-31-安装ImageMagick扩展.md
source_hash: f3ac68ab4fa6
translator: ai
reviewed: false
categories:
  - 技術開発
  - デプロイと運用
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

{% note info simple %}参考：[神不在的星期二](https://www.imooc.com/u/6798278/bbs){% endnote %}

## 説明

最終的に、私は[博客文章](https://www.58bits.com/blog/2018/04/23/installing-imagemagick-use-php-and-iis-windows-server-2012r2-and-windows-10)を書きました。その[文章](https://stackoverflow.com/questions/46960358/how-can-i-install-imagemagick-the-oct-2017-version-for-use-from-php-in-iis-on)は [PhilipD](https://stackoverflow.com/users/706595/philipd) [删除的帖子](https://stackoverflow.com/questions/46960358/how-can-i-install-imagemagick-the-oct-2017-version-for-use-from-php-in-iis-on)の[重新发布，该帖子](https://stackoverflow.com/questions/46960358/how-can-i-install-imagemagick-the-oct-2017-version-for-use-from-php-in-iis-on)が誤った形式で公開され、訂正されなかったものです。そのため、質問は削除されました。

ここに [PhilipD](https://stackoverflow.com/users/706595/philipd) の回答を再掲します。同じ問題に遭遇した人が見つけやすくなるようにするためです。というのも、有効な[博客文章](https://www.58bits.com/blog/2018/04/23/installing-imagemagick-use-php-and-iis-windows-server-2012r2-and-windows-10)を見つけるのに半日かかったからです。これらの手順は 32 ビット版のインストールについて詳しく説明しています。私は 64 ビットの PHP のために 64 ビット版をインストールしました。

このサーバーは Windows Server 2012R2（64 ビット）上にあり、Web サーバーアプリケーションとして IIS を使用しています。しかし、Web サーバーアプリケーション（IIS）が 32 ビットであるため、ImageMagick 関連のソフトウェアはすべて 32 ビット版をインストールしました。以下は 2017 年 10 月時点の最新バージョンを示しています。

## ImageMagick インストーラーのダウンロード

http://www.imagemagick.org/ にアクセスします

メニューバーの「Download」をクリックします

次に、上部のリンクにある「[Windows Binary Releases](http://www.imagemagick.org/script/download.php#windows)」をクリックするか、下にスクロールします

「Win32 dynamic pixel per pixel 16-bit」を選択します。必ず static コンポーネントではなく dynamic コンポーネントを選択してください。

## ImageMagick 用 PHP モジュールのダウンロード

http://windows.php.net/downloads/pecl/releases/imagick/ に移動します

「RC」（リリース候補）ではない最も高いバージョンを選択します – 現在は 3.4.3 です

VC14、x86、IIS 用の「NTS」（非スレッドセーフ）PHP（7.1）バージョンの項目を選択します

ZIP ファイルをダウンロードして保存します。

## ImageMagick を読み込む / 使用するための PHP 依存パッケージのダウンロード

http://windows.php.net/downloads/pecl/deps/ に移動します

最も高いバージョン番号を持つ「ImageMagick」パッケージを選択します

\* このバージョンは上記（1.）のバージョンと異なる場合があることに注意してください

「vc14」および「x86」バージョンを選択します \*

## ダウンロードした各ファイルのブロック解除

ダウンロードの方法によっては必要ない場合もありますが、必要な場合はダウンロードしたファイルを必ず確認して「ブロック解除」してください。

各ファイルを右クリックし、ポップアップメニューから「プロパティ」を選択します

プロパティダイアログに「このファイルは他のコンピューターから取得したものです。このコンピューターを保護するため、このファイルへのアクセスはブロックされる可能性があります。」というテキストが表示された場合、

「ブロック解除」ボタンをクリックします

OK をクリックします。

ダウンロードしたファイル、特に ZIP ファイルを「ブロック解除」しないと、インストールまたはコピーされた個々のファイルが「ブロック」されたままになることがあり、ソフトウェアの実行時に奇妙な問題を引き起こすことがあります。

## Imagick アプリケーションのインストール

管理者として ImageMagick-7.0.7-8-Q16-x86-dll.exe を実行してインストールします

ライセンス契約に同意します

インストール中の各画面でデフォルト設定をそのまま受け入れます。

インストールが完了したら、インストールが成功したかどうかをテストするために、コマンドプロンプトを開いて次の 2 つのコマンドを実行します：

**magick wizard: wizard.jpg**
**magick wizard.jpg win:**
これにより「IMDisplay」ウィンドウが表示され、画架の上でモナリザの肖像画を描くウィザードのスケッチ / 画像が表示されます。

## 依存関係のインストール

手順 3 でダウンロードしたファイルを解凍します。

bin ディレクトリに移動します

**IM*MOD_RL*\*.dll** ファイル（125 個のファイル）を、インストール済みの ImageMagick のフォルダー、たとえば **C:\Program Files (x86)\ImageMagick-7.0.7-Q16** にコピーします

bin ディレクトリに戻ります

**CORE*RL*\*.dll** ファイル（20 個のファイル）を、インストール済みの ImageMagick のフォルダー、たとえば **C:\Program Files (x86)\ImageMagick-7.0.7-Q16\*** にコピーします \* 上書き / 名前変更の確認が表示された場合は、「上書き」を選択します

なお、これにより Imagick のコマンド版が壊れます。magick: 不正な JPEG ライブラリバージョン: ライブラリは 80、呼び出し側は 62 を期待しています

## Imagick PHP 拡張 dll のインストール

手順 2 でダウンロードしたファイルを解凍します。

**php_imagick.dll** ファイルを、サーバー上のインストール済み PHP の「ext」フォルダー、たとえば **C:\php\7.1\ext** にコピーします。

**CORE*RL* \*** ファイルはコピーしないでください

Web 上の一部の記事では、このツールキットから CORE*RL* \* ファイルもコピーして ImageMagick フォルダー内のファイルを置き換えるよう説明されていますが、それは誤りです。これらのファイルの適切なバージョンは手順 6 でコピー済みです。

## php.ini の変更

PHP ソフトウェアのフォルダーにある php.ini ファイル、たとえば「C:\PHP\7.1\php.ini」を編集します

他の拡張機能が記述されているセクションに次の行を追加します：

**extension=php_imagick.dll**

## サーバーの再起動。

IIS の再起動だけでは不十分なようです。コンピューター全体を再起動する必要があります。これは IIS が Imagick の入力 PATH エントリを認識できないことに関係している可能性があります。

## PHPINFO でのテスト

Web ルートに、次の内容を含む PHP ファイルを作成します：

このファイルに Web ブラウザーでアクセスし、

PHPINFO の出力に表示されるはずの「Imagick」セクションを検索します。

次のように表示されるはずです：

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

**重要な注意：**
「対応フォーマット」セクションに何も表示されない場合、またはわずかなフォーマットしか表示されない場合、最も可能性の高い原因は、1 つ以上の IM*MOD_RL* _ または CORE*RL* _ DLL ファイルを ImageMagick フォルダーにコピーするのを忘れたか、「php_magick」ツールキットからコピーしたことです。

## PHP で ImageMagick を使って画像生成をテストする

Web ルートに、次の内容を含む PHP ファイルを作成します（「ImageMagick のインストールを確認する」の項目の入力の 1 つからコピーしました）：

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

この PHP ファイルをブラウザーで実行します。「Hello World!」というテキストを含む画像が表示されるはずです。

## エラーの確認

php-errors.log ファイルにエラーがないか確認します。

php-errors.log ファイルの定義場所は php.ini ファイルで確認できます。このファイルに ImageMagick のインストールに関連する最新のエラーがないか確認します。

## PDF ファイルには Ghostscript が必要
（これは同じ投稿の 2 部構成のうちの 1 部です。）

ImageMagick をインストールし、上記のすべての操作を完了した後、ImageMagick は PHP で画像を変換するために使用できますが、PDF ファイルを画像に変換するために使用することはできません。最後のステップでは、https://www.ghostscript.com/download/gsdnld.html から Ghostscript をインストールする必要があるようです。また、64 ビット版の Ghostscript をインストールした場合にのみ正常に動作します（それ以外はすべて 32 ビット版をインストールしていても）。Ghostscript をインストールするだけで十分です。php.ini やその他の設定を変更する必要はありません。