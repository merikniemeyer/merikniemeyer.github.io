(function () {
  function initMath() {
    if (typeof renderMathInElement !== "function") return;
    renderMathInElement(document.body, {
      delimiters: [
        { left: "$$", right: "$$", display: true },
        { left: "$", right: "$", display: false }
      ]
    });
  }

  function addControlHandlers(video, hideDelayMs) {
    var controlsTimer = null;

    function showControls() {
      video.controls = true;
      if (controlsTimer) {
        window.clearTimeout(controlsTimer);
      }
      controlsTimer = window.setTimeout(function () {
        video.controls = false;
      }, hideDelayMs);
    }

    function hideControls() {
      if (controlsTimer) {
        window.clearTimeout(controlsTimer);
      }
      video.controls = false;
    }

    video.addEventListener("mousemove", showControls);
    video.addEventListener("pointerdown", showControls);
    video.addEventListener("touchstart", showControls);
    video.addEventListener("focus", showControls);
    video.addEventListener("mouseleave", hideControls);
    video.addEventListener("blur", hideControls);

    return {
      showControls: showControls,
      hideControls: hideControls
    };
  }

  function capturePosterOnce(video) {
    var posterCapturedForSrc = null;

    function drawPoster() {
      if (!video.videoWidth || !video.videoHeight) return;
      if (posterCapturedForSrc === video.currentSrc) return;
      var canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      var ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      try {
        video.setAttribute("poster", canvas.toDataURL("image/jpeg", 0.8));
        posterCapturedForSrc = video.currentSrc;
      } catch (e) {}
    }

    return function () {
      if (video.readyState >= 2) {
        drawPoster();
        return;
      }

      video.addEventListener(
        "loadeddata",
        function () {
          drawPoster();
        },
        { once: true }
      );
    };
  }

  function autoplayWhenVisible(video, onVisible) {
    if ("IntersectionObserver" in window) {
      var observer = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
              onVisible();
            }
          });
        },
        { threshold: [0.6] }
      );
      observer.observe(video);
    } else {
      onVisible();
    }
  }

  function attemptAutoplay(video, capturePoster) {
    video.muted = true;
    video.setAttribute("muted", "");
    video.playsInline = true;
    video.setAttribute("playsinline", "");
    if (capturePoster) capturePoster();
    video.playbackRate = 0.8;

    function tryPlay() {
      var playPromise = video.play();
      if (playPromise && playPromise.catch) {
        playPromise.catch(function () {});
      }
    }

    tryPlay();

    video.addEventListener(
      "canplay",
      function () {
        tryPlay();
      },
      { once: true }
    );
  }

  function initGalleryVideo() {
    var video = document.getElementById("gallery-video");
    if (!video) return;

    var tabs = Array.prototype.slice.call(
      document.querySelectorAll(".video-thumb")
    );
    if (!tabs.length) return;

    var hasAutoplayed = false;
    var sequenceCompleted = false;
    var capturePoster = capturePosterOnce(video);

    function setActiveTab(activeTab) {
      tabs.forEach(function (tab) {
        var isActive = tab === activeTab;
        tab.classList.toggle("is-active", isActive);
        tab.setAttribute("aria-selected", isActive ? "true" : "false");
      });
    }

    function playVideo(src) {
      if (!src) return;
      video.controls = false;
      video.classList.add("is-fading");
      window.setTimeout(function () {
        video.pause();
        video.src = src;
        video.load();
        attemptAutoplay(video, capturePoster);
        video.classList.remove("is-fading");
      }, 180);
    }

    tabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        setActiveTab(tab);
        playVideo(tab.getAttribute("data-src"));
      });
    });

    addControlHandlers(video, 3000);

    autoplayWhenVisible(video, function () {
      if (hasAutoplayed) return;
      setActiveTab(tabs[0]);
      playVideo(tabs[0].getAttribute("data-src"));
      hasAutoplayed = true;
    });

    video.addEventListener("ended", function () {
      video.controls = false;
      if (sequenceCompleted) return;
      var activeIndex = tabs.findIndex(function (tab) {
        return tab.classList.contains("is-active");
      });
      var nextIndex = activeIndex + 1;
      if (nextIndex < tabs.length) {
        var nextTab = tabs[nextIndex];
        setActiveTab(nextTab);
        playVideo(nextTab.getAttribute("data-src"));
      } else {
        sequenceCompleted = true;
      }
    });
  }

  function initResearchVideos() {
    var videos = Array.prototype.slice.call(
      document.querySelectorAll(".research-video")
    );
    if (!videos.length) return;

    videos.forEach(function (video) {
      var hasAutoplayed = false;
      var capturePoster = capturePosterOnce(video);

      addControlHandlers(video, 3000);

      autoplayWhenVisible(video, function () {
        if (hasAutoplayed) return;
        hasAutoplayed = true;
        video.controls = false;
        attemptAutoplay(video, capturePoster);
      });

      video.addEventListener("ended", function () {
        video.controls = false;
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initMath();
    initGalleryVideo();
    initResearchVideos();
  });
})();
