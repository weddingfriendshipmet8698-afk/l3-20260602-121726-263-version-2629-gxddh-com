(function () {
    var menuButton = document.querySelector(".menu-toggle");
    var mobilePanel = document.querySelector(".mobile-panel");

    if (menuButton && mobilePanel) {
        menuButton.addEventListener("click", function () {
            mobilePanel.classList.toggle("open");
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    var current = 0;
    var timer = null;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }

        current = (index + slides.length) % slides.length;

        slides.forEach(function (slide, position) {
            slide.classList.toggle("active", position === current);
        });

        dots.forEach(function (dot, position) {
            dot.classList.toggle("active", position === current);
        });
    }

    function startSlider() {
        if (slides.length < 2) {
            return;
        }

        timer = window.setInterval(function () {
            showSlide(current + 1);
        }, 5200);
    }

    dots.forEach(function (dot, index) {
        dot.addEventListener("click", function () {
            if (timer) {
                window.clearInterval(timer);
            }

            showSlide(index);
            startSlider();
        });
    });

    startSlider();

    function runSearch(input) {
        var scope = input.closest("main") || document;
        var items = Array.prototype.slice.call(scope.querySelectorAll(".searchable-list .movie-card, .searchable-list .rank-row"));
        var value = input.value.trim().toLowerCase();

        items.forEach(function (item) {
            var text = ((item.getAttribute("data-title") || "") + " " + (item.getAttribute("data-meta") || "")).toLowerCase();
            item.classList.toggle("hidden-by-search", value && text.indexOf(value) === -1);
        });
    }

    Array.prototype.slice.call(document.querySelectorAll(".page-search")).forEach(function (input) {
        input.addEventListener("input", function () {
            runSearch(input);
        });
    });

    Array.prototype.slice.call(document.querySelectorAll(".clear-search")).forEach(function (button) {
        button.addEventListener("click", function () {
            var bar = button.closest(".filter-bar");
            var input = bar ? bar.querySelector(".page-search") : null;

            if (input) {
                input.value = "";
                runSearch(input);
                input.focus();
            }
        });
    });
})();
