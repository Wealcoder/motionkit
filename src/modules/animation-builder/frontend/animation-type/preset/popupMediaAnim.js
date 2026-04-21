const PRESET_KEY = "wcf-mk-popup-media-fa";
const POPUP_STYLES_ID = "wcf-popup-media-styles";

// Inject popup styles once per document, even if the module is re-imported.
if (
  typeof document !== "undefined" &&
  !document.getElementById(POPUP_STYLES_ID)
) {
  const style = document.createElement("style");
  style.id = POPUP_STYLES_ID;
  style.textContent = `
    body.popup-open {
      overflow: hidden;
      height: 100%;
      position: fixed;
      width: 100%;
    }
    .popup-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
      opacity: 0;
      visibility: hidden;
      overflow-y: auto;
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
    }
    .popup-content {
      background-color: transparent;
      position: relative;
      max-width: 90%;
      max-height: 90%;
      width: 50vw;
      margin: 20px auto;
    }
    @media (max-width: 768px) {
      .popup-content { width: 90vw; }
    }
    .popup-close {
      position: absolute;
      top: -25px;
      right: 0px;
      width: 20px;
      height: 20px;
      cursor: pointer;
      background: none;
      border: none;
      z-index: 1001;
    }
    .popup-close::before,
    .popup-close::after {
      content: '';
      position: absolute;
      top: 50%;
      left: 0;
      width: 100%;
      height: 3px;
      background-color: #ffffff;
      transition: background-color 0.3s ease;
    }
    .popup-close::before { transform: rotate(45deg); }
    .popup-close::after  { transform: rotate(-45deg); }
    .popup-close:hover::before,
    .popup-close:hover::after { background-color: #ff0000; }
    .popup-media {
      max-width: 100%;
      max-height: 80vh;
      display: block;
      width: 100%;
    }
    .popup-video-container {
      position: relative;
      width: 100%;
      height: 0;
      padding-bottom: 56.25%;
    }
    .popup-video {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      border: none;
      object-fit: cover;
      cursor: pointer;
    }
    .youtube-video {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      border: none;
    }
    .popup-play-btn {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 80px;
      height: 80px;
      background-color: rgba(0, 0, 0, 0.7);
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      justify-content: center;
      align-items: center;
      transition: all 0.3s ease;
      z-index: 10;
      border: none;
    }
    .popup-play-btn:hover {
      background-color: rgba(0, 0, 0, 0.9);
      transform: translate(-50%, -50%) scale(1.1);
    }
    .popup-play-btn::after {
      content: '';
      border-style: solid;
      border-width: 15px 0 15px 26px;
      border-color: transparent transparent transparent #ffffff;
      margin-left: 5px;
    }
    .popup-play-btn.playing::after {
      content: '';
      width: 30px;
      height: 30px;
      background: linear-gradient(to right, #fff 30%, transparent 30%, transparent 70%, #fff 70%);
      border: none;
      margin-left: 0;
    }
    .popup-video-wrapper {
      position: relative;
      width: 100%;
      border-radius: 10px;
      overflow: hidden;
    }
    .youtube-container {
      position: relative;
      width: 100%;
      height: 0;
      padding-bottom: 56.25%;
    }
  `;
  document.head.appendChild(style);
}

export function popupMediaAnim() {
  // id -> { teardowns: Array<() => void>, scrollTrigger: ScrollTrigger | null }
  const instances = new Map();

  function getYouTubeId(url) {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/,
      /(?:youtube\.com\/embed\/)([^?]+)/,
      /(?:youtube\.com\/v\/)([^?]+)/,
      /(?:youtube\.com\/watch\?.*v=)([^&]+)/,
    ];
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) return match[1];
    }
    return null;
  }

  function getAnimationProperties(animateFrom) {
    const props = {
      from: { scale: 0.7, opacity: 0 },
      to: { scale: 1, opacity: 1, duration: 0.4, ease: "back.out(1.7)" },
    };
    switch (animateFrom) {
      case "left":
        props.from.x = "-100%";
        props.to.x = "0%";
        break;
      case "right":
        props.from.x = "100%";
        props.to.x = "0%";
        break;
      case "top":
        props.from.y = "-100%";
        props.to.y = "0%";
        break;
      case "bottom":
        props.from.y = "100%";
        props.to.y = "0%";
        break;
      case "rotate_top_left":
        props.from.rotationZ = -180;
        props.from.rotationX = -180;
        props.from.transformOrigin = "0 0";
        props.to.rotationZ = 0;
        props.to.rotationX = 0;
        break;
      case "rotate_top_right":
        props.from.rotationZ = -180;
        props.from.rotationX = -180;
        props.from.transformOrigin = "100% 0";
        props.to.rotationZ = 0;
        props.to.rotationX = 0;
        break;
      case "rotate_bottom_left":
        props.from.rotationZ = -180;
        props.from.rotationX = -180;
        props.from.transformOrigin = "0 100%";
        props.to.rotationZ = 0;
        props.to.rotationX = 0;
        break;
      case "rotate_bottom_right":
        props.from.rotationZ = -180;
        props.from.rotationX = -180;
        props.from.transformOrigin = "100% 100%";
        props.to.rotationZ = 0;
        props.to.rotationX = 0;
        break;
      case "rotate_center":
        props.from.rotationZ = -180;
        props.from.rotationX = -180;
        props.to.rotationZ = 0;
        props.to.rotationX = 0;
        break;
      default:
        // 'center' and unknown — plain scale/opacity only.
        break;
    }
    return props;
  }

  function preventScroll(e) {
    e.preventDefault();
    e.stopPropagation();
    return false;
  }

  function buildVideoElement(mediaUrl) {
    const wrapper = document.createElement("div");
    wrapper.className = "popup-video-wrapper";
    const container = document.createElement("div");
    container.className = "popup-video-container";
    const videoEl = document.createElement("video");
    videoEl.className = "popup-video";
    videoEl.preload = "metadata";
    const source = document.createElement("source");
    source.src = mediaUrl;
    source.type = "video/mp4";
    videoEl.appendChild(source);

    const playButton = document.createElement("button");
    playButton.className = "popup-play-btn";
    playButton.type = "button";

    const togglePlay = () => {
      if (videoEl.paused) {
        const playPromise = videoEl.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => playButton.classList.add("playing"))
            .catch((err) =>
              console.warn("[popupMedia] playback failed:", err),
            );
        }
      } else {
        videoEl.pause();
        playButton.classList.remove("playing");
      }
    };

    videoEl.addEventListener("click", togglePlay);
    playButton.addEventListener("click", (e) => {
      e.stopPropagation();
      togglePlay();
    });
    videoEl.addEventListener("play", () => {
      playButton.classList.add("playing");
      playButton.style.display = "none";
    });
    videoEl.addEventListener("pause", () => {
      playButton.classList.remove("playing");
      playButton.style.display = "flex";
    });
    videoEl.addEventListener("ended", () => {
      playButton.classList.remove("playing");
      playButton.style.display = "flex";
      videoEl.currentTime = 0;
    });

    container.appendChild(videoEl);
    container.appendChild(playButton);
    wrapper.appendChild(container);
    return wrapper;
  }

  function buildMediaElement(mediaType, mediaUrl) {
    switch (mediaType) {
      case "image": {
        const img = document.createElement("img");
        img.src = mediaUrl;
        img.alt = "Popup Image";
        img.className = "popup-media";
        return img;
      }
      case "youtube": {
        const container = document.createElement("div");
        container.className = "youtube-container";
        const videoId = getYouTubeId(mediaUrl);
        if (!videoId) {
          console.warn("[popupMedia] invalid YouTube URL:", mediaUrl);
          return null;
        }
        const iframe = document.createElement("iframe");
        iframe.className = "youtube-video";
        iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
        iframe.allowFullscreen = true;
        iframe.allow =
          "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
        container.appendChild(iframe);
        return container;
      }
      case "video":
        return buildVideoElement(mediaUrl);
      default:
        console.warn(`[popupMedia] unknown mediaType "${mediaType}"`);
        return null;
    }
  }

  function closePopup(overlay, instant = false) {
    if (!overlay || !overlay.parentNode) return;

    const savedScroll = parseInt(overlay.dataset.scrollPosition || "0", 10);

    overlay.querySelector("video")?.pause();
    const iframe = overlay.querySelector("iframe");
    if (iframe && iframe.parentNode) iframe.parentNode.removeChild(iframe);

    document.body.classList.remove("popup-open");
    document.body.style.top = "";
    window.scrollTo(0, savedScroll);

    document.removeEventListener("touchmove", preventScroll);
    document.removeEventListener("wheel", preventScroll);

    const tl = overlay._wcfTimeline;
    const removeNow = () => overlay.parentNode?.removeChild(overlay);

    if (tl && !instant) {
      tl.reverse().then(removeNow);
    } else {
      if (tl) tl.kill();
      removeNow();
    }
  }

  function openPopup({ mediaType, mediaUrl, animateFrom, popupId }) {
    if (!mediaType || !mediaUrl) return;

    // Only one popup at a time — close any existing instantly.
    document
      .querySelectorAll(".popup-overlay")
      .forEach((existing) => closePopup(existing, true));

    const savedScroll = window.pageYOffset;

    const overlay = document.createElement("div");
    overlay.className = "popup-overlay wcfanimb-skip-selector-full";
    overlay.dataset.popupId = popupId;
    overlay.dataset.scrollPosition = String(savedScroll);

    const content = document.createElement("div");
    content.className = "popup-content wcfanimb-skip-selector-full";

    const closeBtn = document.createElement("button");
    closeBtn.className = "popup-close";
    closeBtn.type = "button";

    const mediaEl = buildMediaElement(mediaType, mediaUrl);
    if (!mediaEl) return;

    content.appendChild(mediaEl);
    content.appendChild(closeBtn);
    overlay.appendChild(content);
    document.body.appendChild(overlay);

    // Lock scroll (done AFTER appending so image/video sizing isn't affected).
    document.body.classList.add("popup-open");
    document.body.style.top = `-${savedScroll}px`;
    document.addEventListener("touchmove", preventScroll, { passive: false });
    document.addEventListener("wheel", preventScroll, { passive: false });

    const { from, to } = getAnimationProperties(animateFrom);
    overlay._wcfTimeline = gsap
      .timeline()
      .set(overlay, { visibility: "visible" })
      .to(overlay, { opacity: 1, duration: 0.3 })
      .fromTo(content, from, to, "-=0.2");

    overlay.addEventListener("click", (e) => {
      if (e.target === overlay || e.target.classList.contains("popup-close")) {
        closePopup(overlay);
      }
    });
  }

  function teardown(id) {
    const inst = instances.get(id);
    if (!inst) return;
    inst.teardowns.forEach((fn) => {
      try {
        fn();
      } catch (err) {
        console.warn("[popupMedia] teardown error:", err);
      }
    });
    inst.scrollTrigger?.kill();
    instances.delete(id);
  }

  function teardownAll() {
    for (const id of [...instances.keys()]) teardown(id);
    // Defensive: close any open popup + reset body scroll lock.
    document
      .querySelectorAll(".popup-overlay")
      .forEach((overlay) => closePopup(overlay, true));
    document.body.classList.remove("popup-open");
    document.body.style.top = "";
    document.removeEventListener("touchmove", preventScroll);
    document.removeEventListener("wheel", preventScroll);
  }

  function handler(e) {
    const anim = e?.detail;
    if (!anim || anim.presetKey !== PRESET_KEY) return;
    if (anim.isPublished === false) return;

    const {
      id,
      mediaType,
      mediaUrl,
      trigger: { type: triggerType, selector: triggerSelector } = {},
      vars: { animateFrom = "center" } = {},
    } = anim;

    if (!mediaType || !mediaUrl) {
      console.warn("[popupMedia] missing mediaType or mediaUrl");
      return;
    }

    // Live-update safety: tear down any prior setup for this id.
    teardown(id);

    const teardowns = [];
    let scrollTrigger = null;
    const openFn = () =>
      openPopup({ mediaType, mediaUrl, animateFrom, popupId: id });

    if (triggerType === "page_load") {
      const timerId = setTimeout(openFn, 500);
      teardowns.push(() => clearTimeout(timerId));
    } else {
      if (!triggerSelector) {
        console.warn(
          `[popupMedia] trigger.selector required for triggerType "${triggerType}"`,
        );
        return;
      }

      let elements;
      try {
        elements = document.querySelectorAll(triggerSelector);
      } catch (err) {
        console.warn(
          `[popupMedia] invalid trigger selector "${triggerSelector}":`,
          err.message,
        );
        return;
      }
      if (!elements.length) {
        console.warn(`[popupMedia] no elements match "${triggerSelector}"`);
        return;
      }

      elements.forEach((el) => {
        el.setAttribute("data-wcf-anim-id", id);

        switch (triggerType) {
          case "click":
            el.addEventListener("click", openFn);
            teardowns.push(() => el.removeEventListener("click", openFn));
            break;
          case "hover":
            el.addEventListener("mouseenter", openFn);
            teardowns.push(() => el.removeEventListener("mouseenter", openFn));
            break;
          case "on_scroll":
            if (!window.ScrollTrigger) {
              console.warn("[popupMedia] ScrollTrigger not loaded");
              return;
            }
            scrollTrigger = window.ScrollTrigger.create({
              trigger: el,
              start: "top 80%",
              onEnter: openFn,
              once: true,
            });
            break;
        }
      });
    }

    instances.set(id, { teardowns, scrollTrigger });
  }

  document.addEventListener("aae-animation-event", handler);
  document.addEventListener("aae-reset-animation", teardownAll);

  return {
    destroy: () =>
      document.dispatchEvent(new CustomEvent("aae-reset-animation")),
  };
}

popupMediaAnim();
