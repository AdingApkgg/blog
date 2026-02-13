'use strict';

// 注册 projectCards 标签插件，从 source/_data/projects.yml 读取数据并渲染卡片
hexo.extend.tag.register('projectCards', function () {
  const projects = hexo.locals.get('data').projects;
  if (!projects || !projects.length) {
    return '<div class="projects-container"><p>暂无项目数据</p></div>';
  }

  const cards = projects.map(function (item) {
    const name = item.name || '';
    const link = item.link || '#';
    const img = item.img || '';
    const desc = item.desc || '';

    return '<a class="project-card" href="' + link + '" target="_blank" rel="noopener noreferrer">' +
      '<div class="project-screenshot">' +
        '<img src="' + img + '" alt="' + name + '" loading="lazy" onerror="this.style.display=\'none\'">' +
      '</div>' +
      '<div class="project-info">' +
        '<div class="project-name">' + name + '</div>' +
        '<div class="project-desc">' + desc + '</div>' +
      '</div>' +
    '</a>';
  }).join('\n');

  return '<div class="projects-container">\n' + cards + '\n</div>';
}, { async: false });
