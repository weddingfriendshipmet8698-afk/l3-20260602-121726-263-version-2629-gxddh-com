(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function normalize(value) {
    return (value || "").toString().trim().toLowerCase();
  }

  function initNav() {
    var toggle = document.querySelector(".nav-toggle");
    var nav = document.querySelector(".site-nav");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function () {
      var isOpen = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });
  }

  function initHero() {
    var hero = document.querySelector("[data-hero-slider]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    var prev = document.querySelector("[data-hero-prev]");
    var next = document.querySelector("[data-hero-next]");
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
        start();
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
        start();
      });
    });

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function initSearch() {
    var scopes = Array.prototype.slice.call(document.querySelectorAll("[data-search-scope]"));
    scopes.forEach(function (scope) {
      var input = scope.querySelector("[data-search-input]") || document.querySelector("[data-search-input-global]");
      var select = scope.querySelector("[data-type-select]");
      var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card"));
      var empty = scope.querySelector(".no-results");
      var chips = Array.prototype.slice.call(scope.querySelectorAll("[data-filter-value]"));
      var activeFilter = "all";

      function apply() {
        var keyword = normalize(input ? input.value : "");
        var selectedType = normalize(select ? select.value : "all");
        var visible = 0;
        cards.forEach(function (card) {
          var haystack = normalize(card.getAttribute("data-search"));
          var cardType = normalize(card.getAttribute("data-type"));
          var cardGenre = normalize(card.getAttribute("data-genre"));
          var cardTags = normalize(card.getAttribute("data-tags"));
          var matchesKeyword = !keyword || haystack.indexOf(keyword) !== -1;
          var matchesType = selectedType === "all" || cardType === selectedType;
          var matchesChip = activeFilter === "all" || cardGenre.indexOf(activeFilter) !== -1 || cardTags.indexOf(activeFilter) !== -1 || cardType.indexOf(activeFilter) !== -1;
          var showCard = matchesKeyword && matchesType && matchesChip;
          card.classList.toggle("hide-card", !showCard);
          if (showCard) {
            visible += 1;
          }
        });
        if (empty) {
          empty.style.display = visible ? "none" : "block";
        }
      }

      if (input) {
        input.addEventListener("input", apply);
      }
      if (select) {
        select.addEventListener("change", apply);
      }
      chips.forEach(function (chip) {
        chip.addEventListener("click", function () {
          activeFilter = normalize(chip.getAttribute("data-filter-value"));
          chips.forEach(function (item) {
            item.classList.toggle("is-active", item === chip);
          });
          apply();
        });
      });
      apply();
    });
  }

  function initPlayers() {
    var boxes = Array.prototype.slice.call(document.querySelectorAll("[data-stream]"));
    boxes.forEach(function (box) {
      var video = box.querySelector("video");
      var cover = box.querySelector(".player-cover");
      var stream = box.getAttribute("data-stream");
      var loaded = false;
      var hls = null;

      if (!video || !stream) {
        return;
      }

      function load() {
        if (!loaded) {
          if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = stream;
          } else if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({ enableWorker: true });
            hls.loadSource(stream);
            hls.attachMedia(video);
          } else {
            video.src = stream;
          }
          loaded = true;
        }
        box.classList.add("is-playing");
        var playRequest = video.play();
        if (playRequest && typeof playRequest.catch === "function") {
          playRequest.catch(function () {});
        }
      }

      if (cover) {
        cover.addEventListener("click", load);
      }
      video.addEventListener("click", function () {
        if (video.paused) {
          load();
        }
      });
      video.addEventListener("play", function () {
        box.classList.add("is-playing");
      });
      window.addEventListener("pagehide", function () {
        if (hls && typeof hls.destroy === "function") {
          hls.destroy();
        }
      });
    });
  }

  ready(function () {
    initNav();
    initHero();
    initSearch();
    initPlayers();
  });
})();
