'use strict';

// 注册 projectCards 标签插件，从 source/_data/projects.yml 读取数据并渲染卡片
hexo.extend.tag.register('projectCards', function () {
  const projects = hexo.locals.get('data').projects;
  if (!projects || !projects.length) {
    return '<div class="projects-container"><p>暂无项目数据</p></div>';
  }

  const esc = function (str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  };

  const cards = projects.map(function (item) {
    const name = esc(item.name);
    const link = esc(item.link || '#');
    const img = esc(item.img);
    const desc = esc(item.desc);
    const tag = item.tag ? '<span class="project-tag">' + esc(item.tag) + '</span>' : '';
    const repo = item.repo
      ? '<a class="project-repo" href="' + esc(item.repo) + '" target="_blank" rel="noopener noreferrer" title="源码"><i class="fa-brands fa-github"></i></a>'
      : '';

    return '<div class="project-card">' +
      '<a class="project-shot" href="' + link + '" target="_blank" rel="noopener noreferrer" tabindex="-1">' +
        '<img src="' + img + '" alt="' + name + '" loading="lazy" onerror="this.parentNode.classList.add(\'no-shot\')">' +
      '</a>' +
      '<div class="project-info">' +
        '<div class="project-head">' +
          '<a class="project-name" href="' + link + '" target="_blank" rel="noopener noreferrer">' + name + '</a>' +
          repo +
        '</div>' +
        '<div class="project-desc">' + desc + '</div>' +
        '<div class="project-foot">' + tag +
          '<a class="project-visit" href="' + link + '" target="_blank" rel="noopener noreferrer">前往<i class="fa-solid fa-arrow-up-right-from-square"></i></a>' +
        '</div>' +
      '</div>' +
    '</div>';
  }).join('\n');

  return '<div class="projects-container">\n' + cards + '\n</div>';
}, { async: false });
