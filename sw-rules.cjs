module.exports.cacheRules = {
  simple: {
    match: (url, $eject) =>
      url.host === "blog.saop.cc" &&
      url.pathname.match(
        /\.(woff2|woff|ttf|cur|ico|avif|webp|bmp|svg|raw|png|jpg|jpeg|gif|css|js|json|html|ass|vtt|mov|mpv|mp4|mp3|m4a|moc|mtn|xml)$/
      ),
  },
};

module.exports.getRaceUrls = (srcUrl) => {
  if (srcUrl.startsWith("https://cdn.bootcdn.net/ajax/libs")) {
    const url = new URL(srcUrl);
    return [
      srcUrl,
      `https://lib.baomitu.com` + url.pathname,
      `https://cdn.staticfile.net` + url.pathname,
      `https://npm.elemecdn.com` + url.pathname,
      `https://registry.npmmirror.com` + url.pathname,
      `https://unpkg.com` + url.pathname,
      `https://cdn.jsdelivr.net/npm` + url.pathname,
      `https://fastly.jsdelivr.net/npm` + url.pathname,
    ];
  }
};
