(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function initNavigation() {
    var toggle = document.querySelector("[data-nav-toggle]");
    var menu = document.querySelector("[data-nav-menu]");
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener("click", function () {
      menu.classList.toggle("open");
      document.body.classList.toggle("is-nav-open", menu.classList.contains("open"));
    });
  }

  function initHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === index);
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
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        start();
      });
    });
    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function initImageFallback() {
    document.querySelectorAll("img").forEach(function (img) {
      img.addEventListener("error", function () {
        img.classList.add("image-missing");
      }, { once: true });
    });
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function createCard(item) {
    var tags = (item.tags || []).slice(0, 3).map(function (tag) {
      return "<span>" + escapeHtml(tag) + "</span>";
    }).join("");
    return "" +
      "<article class=\"movie-card\">" +
      "<a class=\"poster-frame\" href=\"" + item.url + "\" aria-label=\"" + escapeHtml(item.title) + "\">" +
      "<img src=\"" + item.cover + "\" alt=\"" + escapeHtml(item.title) + "\" loading=\"lazy\">" +
      "<span class=\"poster-play\">▶</span>" +
      "<span class=\"poster-badge\">" + escapeHtml(item.category) + "</span>" +
      "<span class=\"poster-rating\">★ " + escapeHtml(item.rating) + "</span>" +
      "</a>" +
      "<div class=\"card-body\">" +
      "<h3><a href=\"" + item.url + "\">" + escapeHtml(item.title) + "</a></h3>" +
      "<p>" + escapeHtml(item.oneLine) + "</p>" +
      "<div class=\"card-meta\"><span>" + escapeHtml(item.year) + "</span><span>" + escapeHtml(item.region) + "</span><span>" + escapeHtml(item.type) + "</span></div>" +
      "<div class=\"tag-row\">" + tags + "</div>" +
      "<div class=\"card-actions\"><a href=\"" + item.play + "\">立即观看</a><a href=\"" + item.url + "\">详情</a></div>" +
      "</div>" +
      "</article>";
  }

  function initSearchPage() {
    var results = document.querySelector("[data-search-results]");
    var form = document.querySelector("[data-search-form]");
    var input = document.querySelector("[data-search-input]");
    if (!results || !window.SITE_SEARCH_DATA) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var query = params.get("q") || "";
    if (input) {
      input.value = query;
    }

    function render(value) {
      var words = value.trim().toLowerCase().split(/\s+/).filter(Boolean);
      var source = window.SITE_SEARCH_DATA;
      var matched = source.filter(function (item) {
        if (!words.length) {
          return item.id <= 48;
        }
        var haystack = [
          item.title,
          item.region,
          item.type,
          item.year,
          item.genre,
          item.category,
          item.oneLine,
          (item.tags || []).join(" ")
        ].join(" ").toLowerCase();
        return words.every(function (word) {
          return haystack.indexOf(word) !== -1;
        });
      }).slice(0, 120);
      results.innerHTML = matched.map(createCard).join("");
      initImageFallback();
    }

    if (form && input) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var next = input.value.trim();
        var url = next ? "./search.html?q=" + encodeURIComponent(next) : "./search.html";
        window.history.replaceState(null, "", url);
        render(next);
      });
    }
    render(query);
  }

  ready(function () {
    initNavigation();
    initHero();
    initImageFallback();
    initSearchPage();
  });
})();
