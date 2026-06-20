(function () {
    function attachSource(video, source) {
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = source;
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });

            hls.loadSource(source);
            hls.attachMedia(video);
            return;
        }

        video.src = source;
    }

    window.initMoviePlayer = function (videoId, buttonId, source) {
        var video = document.getElementById(videoId);
        var button = document.getElementById(buttonId);
        var loaded = false;

        if (!video || !button || !source) {
            return;
        }

        function start() {
            if (!loaded) {
                attachSource(video, source);
                loaded = true;
            }

            button.classList.add("is-hidden");
            video.setAttribute("controls", "controls");
            video.play().catch(function () {});
        }

        button.addEventListener("click", start);
        video.addEventListener("click", function () {
            if (video.paused) {
                start();
            }
        });
    };
})();
