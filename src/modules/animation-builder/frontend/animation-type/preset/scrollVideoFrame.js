const PRESET_KEY = "wcf-mk-scroll-vf-fa";

export function scrollVideoFrame() {
  // id -> { timelines: GSAPTimeline[], cleanups: Array<() => void> }
  const instances = new Map();

  function once(el, event, fn, opts) {
    const onceFn = function (e) {
      el.removeEventListener(event, onceFn);
      fn.apply(this, arguments);
    };
    el.addEventListener(event, onceFn, opts);
    return onceFn;
  }

  function teardown(id) {
    const inst = instances.get(id);
    if (!inst) return;
    inst.timelines.forEach((tl) => {
      try {
        tl.revert();
        tl.kill();
      } catch (err) {
        console.warn("[scrollVideoFrame] timeline teardown error:", err);
      }
    });
    inst.cleanups.forEach((fn) => {
      try {
        fn();
      } catch (err) {
        console.warn("[scrollVideoFrame] cleanup error:", err);
      }
    });
    instances.delete(id);
  }

  function teardownAll() {
    for (const id of [...instances.keys()]) teardown(id);
  }

  function handler(e) {
    const anim = e?.detail;
    if (!anim || anim.presetKey !== PRESET_KEY) return;
    if (anim.isPublished === false) return;
    if (!anim.containerClass || !anim.itemClass) return;

    const { id, containerClass, itemClass, vars = {} } = anim;
    const { containerHeight } = vars;
    if (!containerHeight) return;

    let containerEl;
    try {
      containerEl = document.querySelector(containerClass);
    } catch (err) {
      console.warn(
        `[scrollVideoFrame] invalid containerClass "${containerClass}":`,
        err.message,
      );
      return;
    }
    if (!containerEl) return;

    let video;
    try {
      video = document.querySelector(itemClass);
    } catch (err) {
      console.warn(
        `[scrollVideoFrame] invalid itemClass "${itemClass}":`,
        err.message,
      );
      return;
    }
    if (!video) return;

    teardown(id);

    containerEl.setAttribute("data-wcf-anim-id", id);
    video.setAttribute("data-wcf-anim-id", id);

    gsap.set(containerEl, {
      height: containerHeight,
      transition: "none",
    });
    gsap.set(video, { maxHeight: "100vh" });

    const src = video.currentSrc || video.src;
    video.removeAttribute("controls");

    const tl = gsap.timeline({
      defaults: { duration: 1 },
      scrollTrigger: {
        trigger: containerEl,
        pin: true,
        start: "top top",
        end: "bottom bottom",
        scrub: true,
        pinSpacing: false,
      },
    });

    once(document.documentElement, "touchstart", () => {
      video.play();
      video.pause();
    });

    once(video, "loadedmetadata", () => {
      tl.to(video, {
        currentTime: video.duration,
        ease: "none",
      });
    });

    // Cross-browser scrubbable video trick: re-fetch as blob so Safari/iOS
    // can seek frames independently.
    const timer = setTimeout(() => {
      if (!window.fetch) return;
      fetch(src)
        .then((response) => response.blob())
        .then((blob) => {
          const blobURL = URL.createObjectURL(blob);
          const t = video.currentTime;
          once(document.documentElement, "touchstart", () => {
            video.play();
            video.pause();
          });
          video.setAttribute("src", blobURL);
          video.currentTime = t + 0.01;
        })
        .catch((err) =>
          console.warn("[scrollVideoFrame] blob fetch failed:", err),
        );
    }, 1000);

    const cleanups = [() => clearTimeout(timer)];

    instances.set(id, { timelines: [tl], cleanups });
  }

  document.addEventListener("aae-animation-event", handler);
  document.addEventListener("aae-reset-animation", teardownAll);

  return {
    destroy: () =>
      document.dispatchEvent(new CustomEvent("aae-reset-animation")),
  };
}

scrollVideoFrame();
