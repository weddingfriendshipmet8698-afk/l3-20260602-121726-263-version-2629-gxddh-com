(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            mobileNav.classList.toggle('open');
        });
    }

    var carousel = document.querySelector('[data-hero-carousel]');

    if (carousel) {
        var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
        var index = 0;

        function showSlide(nextIndex) {
            if (!slides.length) {
                return;
            }

            index = (nextIndex + slides.length) % slides.length;

            slides.forEach(function (slide, i) {
                slide.classList.toggle('active', i === index);
            });

            dots.forEach(function (dot, i) {
                dot.classList.toggle('active', i === index);
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
            });
        });

        if (slides.length > 1) {
            window.setInterval(function () {
                showSlide(index + 1);
            }, 5200);
        }
    }

    var filterRoot = document.querySelector('[data-filter-root]');

    if (filterRoot) {
        var searchInput = filterRoot.querySelector('[data-search]');
        var kindFilter = filterRoot.querySelector('[data-kind-filter]');
        var yearFilter = filterRoot.querySelector('[data-year-filter]');
        var cards = Array.prototype.slice.call(filterRoot.querySelectorAll('[data-card]'));
        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get('q');

        if (initialQuery && searchInput) {
            searchInput.value = initialQuery;
        }

        function yearMatches(year, value) {
            if (value === 'all') {
                return true;
            }

            if (value === 'future') {
                return year >= 2026;
            }

            if (value === '2020s') {
                return year >= 2020 && year <= 2025;
            }

            if (value === '2010s') {
                return year >= 2010 && year <= 2019;
            }

            if (value === '2000s') {
                return year >= 2000 && year <= 2009;
            }

            return year > 0 && year <= 1999;
        }

        function applyFilters() {
            var query = searchInput ? searchInput.value.trim().toLowerCase() : '';
            var kind = kindFilter ? kindFilter.value : 'all';
            var yearValue = yearFilter ? yearFilter.value : 'all';

            cards.forEach(function (card) {
                var searchable = [
                    card.getAttribute('data-title') || '',
                    card.getAttribute('data-region') || '',
                    card.getAttribute('data-genre') || '',
                    card.getAttribute('data-kind') || ''
                ].join(' ').toLowerCase();
                var cardKind = card.getAttribute('data-kind') || '';
                var cardYear = Number(card.getAttribute('data-year-number')) || 0;
                var visible = (!query || searchable.indexOf(query) !== -1)
                    && (kind === 'all' || cardKind === kind)
                    && yearMatches(cardYear, yearValue);

                card.classList.toggle('hidden-by-filter', !visible);
            });
        }

        [searchInput, kindFilter, yearFilter].forEach(function (control) {
            if (control) {
                control.addEventListener('input', applyFilters);
                control.addEventListener('change', applyFilters);
            }
        });

        applyFilters();
    }

    var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));
    var hlsLoaderPromise = null;

    function loadHls() {
        if (window.Hls) {
            return Promise.resolve(window.Hls);
        }

        if (!hlsLoaderPromise) {
            hlsLoaderPromise = new Promise(function (resolve, reject) {
                var script = document.createElement('script');
                script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.17/dist/hls.min.js';
                script.onload = function () {
                    resolve(window.Hls);
                };
                script.onerror = reject;
                document.head.appendChild(script);
            });
        }

        return hlsLoaderPromise;
    }

    players.forEach(function (player) {
        var video = player.querySelector('video');
        var layer = player.querySelector('.play-layer');
        var videoUrl = player.getAttribute('data-video');
        var attached = false;
        var hlsInstance = null;

        function attachWith(Hls) {
            if (!video || !videoUrl || attached) {
                return;
            }

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = videoUrl;
                attached = true;
                return;
            }

            if (Hls && Hls.isSupported()) {
                hlsInstance = new Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(videoUrl);
                hlsInstance.attachMedia(video);
                attached = true;
                return;
            }

            video.src = videoUrl;
            attached = true;
        }

        function start() {
            if (!video || !videoUrl) {
                return;
            }

            function playNow() {
                if (layer) {
                    layer.classList.add('is-hidden');
                }
                var promise = video.play();
                if (promise && typeof promise.catch === 'function') {
                    promise.catch(function () {});
                }
            }

            if (attached) {
                playNow();
                return;
            }

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                attachWith(null);
                playNow();
                return;
            }

            loadHls().then(function (Hls) {
                attachWith(Hls);
                playNow();
            }).catch(function () {
                attachWith(null);
                playNow();
            });
        }

        if (layer) {
            layer.addEventListener('click', start);
        }

        if (video) {
            video.addEventListener('click', function () {
                if (!attached || video.paused) {
                    start();
                }
            });
            video.addEventListener('play', function () {
                if (layer) {
                    layer.classList.add('is-hidden');
                }
            });
        }

        window.addEventListener('pagehide', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    });
})();
