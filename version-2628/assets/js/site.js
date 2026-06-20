(function() {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  ready(function() {
    var toggle = document.querySelector('.menu-toggle');
    var panel = document.querySelector('.mobile-panel');

    if (toggle && panel) {
      toggle.addEventListener('click', function() {
        var open = panel.classList.toggle('is-open');
        toggle.setAttribute('aria-expanded', String(open));
      });
    }

    initHero();
    initCardFilters();
    initSearchPage();
  });

  function initHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var next = document.querySelector('[data-hero-next]');
    var prev = document.querySelector('[data-hero-prev]');
    var index = 0;
    var timer = null;

    if (!slides.length) {
      return;
    }

    function show(target) {
      index = (target + slides.length) % slides.length;
      slides.forEach(function(slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function(dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function() {
        show(index + 1);
      }, 5600);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function(dot, dotIndex) {
      dot.addEventListener('click', function() {
        show(dotIndex);
        start();
      });
    });

    if (next) {
      next.addEventListener('click', function() {
        show(index + 1);
        start();
      });
    }

    if (prev) {
      prev.addEventListener('click', function() {
        show(index - 1);
        start();
      });
    }

    start();
  }

  function initCardFilters() {
    var inputs = Array.prototype.slice.call(document.querySelectorAll('[data-card-search]'));
    var groups = Array.prototype.slice.call(document.querySelectorAll('.filter-actions'));

    inputs.forEach(function(input) {
      input.addEventListener('input', function() {
        applyFilter(input.dataset.scope || '#movieGrid');
      });
    });

    groups.forEach(function(group) {
      group.addEventListener('click', function(event) {
        var button = event.target.closest('[data-filter-value]');
        if (!button) {
          return;
        }
        Array.prototype.slice.call(group.querySelectorAll('[data-filter-value]')).forEach(function(item) {
          item.classList.remove('is-active');
        });
        button.classList.add('is-active');
        group.dataset.activeFilter = button.dataset.filterValue || 'all';
        applyFilter(group.dataset.scope || '#movieGrid');
      });
    });
  }

  function applyFilter(scopeSelector) {
    var scope = document.querySelector(scopeSelector);
    if (!scope) {
      return;
    }
    var input = document.querySelector('[data-card-search][data-scope="' + scopeSelector + '"]');
    var group = document.querySelector('.filter-actions[data-scope="' + scopeSelector + '"]');
    var query = input ? input.value.trim().toLowerCase() : '';
    var active = group ? group.dataset.activeFilter || 'all' : 'all';
    var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card'));

    cards.forEach(function(card) {
      var text = (card.dataset.search || '').toLowerCase();
      var title = (card.dataset.title || '').toLowerCase();
      var type = card.dataset.type || '';
      var year = card.dataset.year || '';
      var matchesQuery = !query || text.indexOf(query) !== -1 || title.indexOf(query) !== -1;
      var matchesFilter = active === 'all' || type.indexOf(active) !== -1 || year === active || text.indexOf(active.toLowerCase()) !== -1;
      card.classList.toggle('is-hidden', !(matchesQuery && matchesFilter));
    });
  }

  function initSearchPage() {
    var input = document.getElementById('searchInput');
    var results = document.getElementById('searchResults');
    var hint = document.getElementById('searchHint');

    if (!input || !results || !window.SEARCH_MOVIES) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';
    input.value = initial;

    function render() {
      var query = input.value.trim().toLowerCase();
      results.innerHTML = '';
      if (!query) {
        hint.textContent = '输入关键词后显示匹配内容。';
        return;
      }
      var matched = window.SEARCH_MOVIES.filter(function(item) {
        return item.search.indexOf(query) !== -1;
      }).slice(0, 80);
      hint.textContent = matched.length ? '点击卡片进入详情页。' : '没有找到匹配内容。';
      matched.forEach(function(item) {
        var card = document.createElement('article');
        card.className = 'movie-card search-card';
        card.innerHTML = [
          '<a class="card-link" href="' + escapeHtml(item.url) + '">',
          '<span class="poster-frame">',
          '<img src="' + escapeHtml(item.cover) + '" alt="' + escapeHtml(item.title) + '" loading="lazy">',
          '<span class="poster-shade"></span>',
          '<span class="card-badge">' + escapeHtml(item.category) + '</span>',
          '</span>',
          '<span class="card-body">',
          '<strong>' + escapeHtml(item.title) + '</strong>',
          '<span class="card-meta">' + escapeHtml(item.meta) + '</span>',
          '<span class="card-summary">' + escapeHtml(item.line) + '</span>',
          '</span>',
          '</a>'
        ].join('');
        results.appendChild(card);
      });
    }

    input.addEventListener('input', render);
    render();
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}());
