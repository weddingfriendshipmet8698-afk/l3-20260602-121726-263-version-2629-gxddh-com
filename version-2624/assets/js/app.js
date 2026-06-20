(function () {
  var mobileToggle = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (mobileToggle && mobileNav) {
    mobileToggle.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === current);
      });
    }

    function advance(step) {
      show(current + step);
    }

    function start() {
      stop();
      timer = setInterval(function () {
        advance(1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        advance(-1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        advance(1);
        start();
      });
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        start();
      });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  var filterLists = Array.prototype.slice.call(document.querySelectorAll('[data-filter-list]'));

  filterLists.forEach(function (list) {
    var scope = list.closest('[data-filter-scope]') || document;
    var input = scope.querySelector('[data-filter-input]');
    var select = scope.querySelector('[data-filter-select]');
    var tabs = Array.prototype.slice.call(scope.querySelectorAll('[data-filter-tab]'));
    var empty = scope.querySelector('[data-empty-state]');
    var cards = Array.prototype.slice.call(list.querySelectorAll('[data-filter-card]'));
    var activeType = 'all';

    function normalize(value) {
      return String(value || '').trim().toLowerCase();
    }

    function apply() {
      var q = normalize(input ? input.value : '');
      var region = normalize(select ? select.value : 'all');
      var visible = 0;

      cards.forEach(function (card) {
        var text = normalize(card.getAttribute('data-search'));
        var cardRegion = normalize(card.getAttribute('data-region'));
        var cardType = normalize(card.getAttribute('data-type'));
        var okQuery = !q || text.indexOf(q) !== -1;
        var okRegion = region === 'all' || cardRegion === region;
        var okType = activeType === 'all' || cardType === activeType;
        var ok = okQuery && okRegion && okType;
        card.style.display = ok ? '' : 'none';
        if (ok) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('show', visible === 0);
      }
    }

    if (input) {
      input.addEventListener('input', apply);
      var params = new URLSearchParams(window.location.search);
      var q = params.get('q');
      if (q) {
        input.value = q;
      }
    }

    if (select) {
      select.addEventListener('change', apply);
    }

    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        activeType = normalize(tab.getAttribute('data-filter-tab')) || 'all';
        tabs.forEach(function (item) {
          item.classList.toggle('active', item === tab);
        });
        apply();
      });
    });

    apply();
  });

  window.SitePlayer = {
    mount: function (id, url) {
      var video = document.getElementById(id);
      if (!video || !url) {
        return;
      }

      var frame = video.closest('[data-player]');
      var cover = frame ? frame.querySelector('[data-play]') : null;
      var message = frame ? frame.querySelector('[data-error]') : null;
      var attached = false;
      var hls = null;

      function fail() {
        if (message) {
          message.textContent = '视频加载失败，请刷新重试';
        }
      }

      function attach() {
        if (attached) {
          return;
        }
        attached = true;

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = url;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(url);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                hls.startLoad();
              } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                hls.recoverMediaError();
              } else {
                fail();
              }
            }
          });
        } else {
          fail();
        }
      }

      function play() {
        attach();
        if (cover) {
          cover.classList.add('is-hidden');
        }
        video.controls = true;
        var attempt = video.play();
        if (attempt && attempt.catch) {
          attempt.catch(function () {
            video.addEventListener('canplay', function () {
              video.play().catch(fail);
            }, { once: true });
          });
        }
      }

      if (cover) {
        cover.addEventListener('click', play);
      }

      video.addEventListener('click', function () {
        if (video.paused) {
          play();
        }
      });

      window.addEventListener('pagehide', function () {
        if (hls) {
          hls.destroy();
        }
      });
    }
  };
})();
