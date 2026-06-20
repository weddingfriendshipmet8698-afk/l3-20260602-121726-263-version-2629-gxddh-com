document.addEventListener('DOMContentLoaded', function () {
  var video = document.querySelector('[data-player-video]');
  var button = document.querySelector('[data-player-button]');
  var cover = document.querySelector('[data-player-cover]');
  var state = document.querySelector('[data-player-state]');

  if (!video) {
    return;
  }

  var source = video.getAttribute('data-src');

  function setState(message) {
    if (state) {
      state.textContent = message || '';
    }
  }

  function prepareVideo() {
    if (!source) {
      setState('当前播放源暂不可用');
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });

      hls.loadSource(source);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
        setState('播放源已就绪，点击开始观看');
      });
      hls.on(window.Hls.Events.ERROR, function (_, data) {
        if (!data || !data.fatal) {
          return;
        }

        if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
          setState('网络连接异常，正在重新加载');
          hls.startLoad();
          return;
        }

        if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
          setState('媒体加载异常，正在尝试恢复');
          hls.recoverMediaError();
          return;
        }

        setState('播放失败，请稍后再试');
        hls.destroy();
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      setState('播放源已就绪，点击开始观看');
    } else {
      setState('当前浏览器暂不支持此播放格式');
    }
  }

  if (button) {
    button.addEventListener('click', function () {
      if (cover) {
        cover.classList.add('hidden');
      }

      video.play().then(function () {
        setState('正在播放');
      }).catch(function () {
        setState('请再次点击播放按钮');
      });
    });
  }

  video.addEventListener('pause', function () {
    if (!video.ended) {
      setState('已暂停');
    }
  });

  video.addEventListener('play', function () {
    setState('正在播放');
  });

  prepareVideo();
});
