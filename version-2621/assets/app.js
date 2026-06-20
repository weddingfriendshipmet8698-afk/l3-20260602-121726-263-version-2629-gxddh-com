(function () {
  function ready(callback) {
    if (document.readyState !== 'loading') {
      callback();
      return;
    }
    document.addEventListener('DOMContentLoaded', callback);
  }

  function setupMobileMenu() {
    var button = document.querySelector('[data-menu-toggle]');
    var menu = document.querySelector('[data-mobile-nav]');
    if (!button || !menu) {
      return;
    }

    button.addEventListener('click', function () {
      var isOpen = menu.classList.toggle('is-open');
      button.setAttribute('aria-expanded', String(isOpen));
    });
  }

  function setupHeroSlider() {
    var slider = document.querySelector('[data-hero-slider]');
    if (!slider) {
      return;
    }

    var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
    var prev = slider.querySelector('[data-hero-prev]');
    var next = slider.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
        dot.setAttribute('aria-current', dotIndex === index ? 'true' : 'false');
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
        start();
      });
    });

    slider.addEventListener('mouseenter', stop);
    slider.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function normalize(text) {
    return String(text || '').toLowerCase().trim();
  }

  function setupFilters() {
    var panels = Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]'));
    panels.forEach(function (panel) {
      var input = panel.querySelector('[data-filter-input]');
      var scopeSelector = panel.getAttribute('data-filter-scope') || 'body';
      var scope = document.querySelector(scopeSelector) || document;
      var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-movie-card]'));
      var count = panel.querySelector('[data-filter-count]');
      var empty = scope.querySelector('[data-empty-note]');
      var pills = Array.prototype.slice.call(panel.querySelectorAll('[data-filter-value]'));
      var activeValue = 'all';

      var params = new URLSearchParams(window.location.search);
      var queryFromUrl = params.get('q');
      if (queryFromUrl && input) {
        input.value = queryFromUrl;
      }

      function update() {
        var keyword = normalize(input ? input.value : '');
        var visible = 0;

        cards.forEach(function (card) {
          var haystack = normalize([
            card.getAttribute('data-title'),
            card.getAttribute('data-tags'),
            card.getAttribute('data-region'),
            card.getAttribute('data-genre'),
            card.getAttribute('data-year'),
            card.getAttribute('data-type')
          ].join(' '));
          var category = card.getAttribute('data-category') || '';
          var matchesKeyword = !keyword || haystack.indexOf(keyword) !== -1;
          var matchesPill = activeValue === 'all' || category === activeValue || haystack.indexOf(activeValue) !== -1;
          var shouldShow = matchesKeyword && matchesPill;

          card.classList.toggle('is-hidden', !shouldShow);
          if (shouldShow) {
            visible += 1;
          }
        });

        if (count) {
          count.textContent = '显示 ' + visible + ' / ' + cards.length + ' 部';
        }

        if (empty) {
          empty.classList.toggle('is-visible', visible === 0);
        }
      }

      if (input) {
        input.addEventListener('input', update);
      }

      pills.forEach(function (pill) {
        pill.addEventListener('click', function () {
          activeValue = pill.getAttribute('data-filter-value') || 'all';
          pills.forEach(function (item) {
            item.classList.toggle('is-active', item === pill);
          });
          update();
        });
      });

      update();
    });
  }

  function setupPlayer() {
    var video = document.querySelector('[data-hls-player]');
    var button = document.querySelector('[data-play-button]');
    var status = document.querySelector('[data-player-status]');
    if (!video) {
      return;
    }

    var source = video.getAttribute('data-src');
    var hlsInstance = null;
    var initialized = false;

    function setStatus(message) {
      if (status) {
        status.textContent = message;
      }
    }

    function hideButton() {
      if (button) {
        button.classList.add('is-hidden');
      }
    }

    function playVideo() {
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {
          setStatus('已加载播放源，请在播放器控制栏中点击播放。');
        });
      }
    }

    function initPlayer() {
      if (!source) {
        setStatus('当前影片未配置播放源。');
        return;
      }

      hideButton();

      if (initialized) {
        playVideo();
        return;
      }

      initialized = true;
      setStatus('正在加载播放源...');

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          setStatus('播放源已就绪，支持 HLS/m3u8 在线播放。');
          playVideo();
        });
        hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            setStatus('播放源加载遇到问题，请稍后重试或更换浏览器。');
          }
        });
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        video.addEventListener('loadedmetadata', function () {
          setStatus('播放源已就绪，当前浏览器正在使用原生 HLS 播放。');
          playVideo();
        }, { once: true });
        return;
      }

      video.src = source;
      setStatus('已绑定播放源；如无法播放，请使用支持 HLS 的浏览器访问。');
      playVideo();
    }

    if (button) {
      button.addEventListener('click', initPlayer);
    }

    video.addEventListener('click', function () {
      if (!initialized) {
        initPlayer();
      }
    });

    video.addEventListener('play', hideButton);

    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  ready(function () {
    setupMobileMenu();
    setupHeroSlider();
    setupFilters();
    setupPlayer();
  });
})();
