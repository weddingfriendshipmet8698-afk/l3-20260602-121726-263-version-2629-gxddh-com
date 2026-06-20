
(function () {
  "use strict";

  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    setupMobileNavigation();
    setupHeroCarousel();
    setupCardFilters();
    setupPlayers();
  });

  function setupMobileNavigation() {
    var button = document.querySelector(".nav-toggle");
    var nav = document.querySelector(".main-nav");

    if (!button || !nav) {
      return;
    }

    button.addEventListener("click", function () {
      var isOpen = nav.classList.toggle("is-open");
      button.setAttribute("aria-expanded", String(isOpen));
    });
  }

  function setupHeroCarousel() {
    var root = document.querySelector(".hero-carousel");

    if (!root) {
      return;
    }

    var slides = Array.prototype.slice.call(root.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(root.querySelectorAll(".hero-dots button"));
    var previous = root.querySelector(".hero-prev");
    var next = root.querySelector(".hero-next");
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    function startTimer() {
      stopTimer();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5000);
    }

    function stopTimer() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (previous) {
      previous.addEventListener("click", function () {
        show(current - 1);
        startTimer();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
        startTimer();
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
        startTimer();
      });
    });

    root.addEventListener("mouseenter", stopTimer);
    root.addEventListener("mouseleave", startTimer);
    show(0);
    startTimer();
  }

  function setupCardFilters() {
    var scopes = Array.prototype.slice.call(document.querySelectorAll(".js-filter-scope"));

    if (!scopes.length) {
      return;
    }

    var input = document.querySelector(".js-card-search");
    var year = document.querySelector(".js-year-filter");
    var type = document.querySelector(".js-type-filter");
    var reset = document.querySelector(".filter-reset");
    var empty = document.querySelector(".empty-result");

    function normalize(value) {
      return String(value || "").trim().toLowerCase();
    }

    function apply() {
      var query = normalize(input ? input.value : "");
      var selectedYear = normalize(year ? year.value : "");
      var selectedType = normalize(type ? type.value : "");
      var visibleCount = 0;

      scopes.forEach(function (scope) {
        var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card"));

        cards.forEach(function (card) {
          var searchText = normalize(card.getAttribute("data-search"));
          var cardYear = normalize(card.getAttribute("data-year"));
          var cardType = normalize(card.getAttribute("data-type"));
          var matched = true;

          if (query && searchText.indexOf(query) === -1) {
            matched = false;
          }

          if (selectedYear && cardYear !== selectedYear) {
            matched = false;
          }

          if (selectedType && cardType.indexOf(selectedType) === -1) {
            matched = false;
          }

          card.hidden = !matched;

          if (matched) {
            visibleCount += 1;
          }
        });
      });

      if (empty) {
        empty.hidden = visibleCount !== 0;
      }
    }

    [input, year, type].forEach(function (control) {
      if (control) {
        control.addEventListener("input", apply);
        control.addEventListener("change", apply);
      }
    });

    if (reset) {
      reset.addEventListener("click", function () {
        if (input) {
          input.value = "";
        }
        if (year) {
          year.value = "";
        }
        if (type) {
          type.value = "";
        }
        apply();
      });
    }
  }

  function setupPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll(".js-player"));

    players.forEach(function (box) {
      var video = box.querySelector("video");
      var button = box.querySelector(".player-start");
      var message = box.querySelector(".player-message");
      var source = box.getAttribute("data-src");
      var hlsInstance = null;

      if (!video || !button || !source) {
        return;
      }

      function setMessage(text) {
        if (message) {
          message.textContent = text || "";
        }
      }

      function attachSource() {
        if (video.getAttribute("data-loaded") === "true") {
          return;
        }

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
          video.setAttribute("data-loaded", "true");
          return;
        }

        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              setMessage("播放源加载失败，请刷新页面后重试。");
            }
          });
          video.setAttribute("data-loaded", "true");
          return;
        }

        video.src = source;
        video.setAttribute("data-loaded", "true");
        setMessage("当前浏览器可能不支持 HLS，建议使用 Safari、Edge 或 Chrome 访问。");
      }

      button.addEventListener("click", function () {
        attachSource();
        video.controls = true;
        box.classList.add("is-playing");

        var playPromise = video.play();

        if (playPromise && typeof playPromise.catch === "function") {
          playPromise.catch(function () {
            setMessage("浏览器阻止了自动播放，请再次点击播放器开始播放。");
          });
        }
      });

      video.addEventListener("ended", function () {
        if (hlsInstance) {
          hlsInstance.stopLoad();
        }
      });
    });
  }
})();
