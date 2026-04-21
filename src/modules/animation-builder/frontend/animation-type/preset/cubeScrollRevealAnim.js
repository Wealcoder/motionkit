const PRESET_KEY = "wcf-mk-scroll-cr-fa";

export function cubeScrollRevealAnim() {
  // id -> { timelines, scrollTriggers, cleanups }
  const instances = new Map();

  function teardown(id) {
    const inst = instances.get(id);
    if (!inst) return;
    inst.timelines.forEach((tl) => {
      try {
        tl.scrollTrigger?.kill();
        tl.kill();
      } catch (err) {
        console.warn("[cubeScroll] timeline teardown error:", err);
      }
    });
    inst.scrollTriggers.forEach((st) => {
      try {
        st.kill();
      } catch (err) {
        console.warn("[cubeScroll] scrollTrigger teardown error:", err);
      }
    });
    inst.cleanups.forEach((fn) => {
      try {
        fn();
      } catch (err) {
        console.warn("[cubeScroll] cleanup error:", err);
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
    if (!anim.itemClass || !anim.endSectionClass) return;

    const {
      id,
      itemClass,
      endSectionClass,
      frontMedia,
      backMedia,
      leftMedia,
      rightMedia,
      topMedia,
      bottomMedia,
      vars = {},
    } = anim;

    const {
      cubeMinWidth,
      cubeMaxWidth,
      cubeMaxHeight,
      position,
      expandFace,
      scale,
      cubeAnimStart,
      cubeAnimCStart,
    } = vars;

    const cubeMinWidthNum = parseFloat(cubeMinWidth) || 0;
    const cubeMaxWidthNum = parseFloat(cubeMaxWidth) || 0;
    const cubeMaxHeightNum = parseFloat(cubeMaxHeight) || 0;
    const positionNum = parseFloat(position) || 0;
    const scaleNum = parseFloat(scale) || 1;

    let container;
    try {
      container = document.querySelector(itemClass);
    } catch (err) {
      console.warn(
        `[cubeScroll] invalid itemClass "${itemClass}":`,
        err.message,
      );
      return;
    }
    if (!container) return;

    teardown(id);

    container.setAttribute("data-wcf-anim-id", id);
    container.classList.add("wcfanimb-skip-selector-full");
    container.innerHTML = "";

    // Build cube DOM ─────────────────────────────────────────────────
    const scrollContainer = document.createElement("div");
    scrollContainer.className = "aab_wc-scroll-container";

    const scene = document.createElement("div");
    scene.className = "aab_wc-scene";

    const animContainer = document.createElement("div");
    animContainer.className = "aab_wc-animation-container";
    animContainer.style.width = `${cubeMinWidthNum}px`;
    animContainer.style.height = `${cubeMinWidthNum}px`;

    const cube = document.createElement("div");
    cube.className = "aab_wc-cube";

    const mediaMap = {
      front: frontMedia,
      back: backMedia,
      left: leftMedia,
      right: rightMedia,
      top: topMedia,
      bottom: bottomMedia,
    };

    const getFaceContent = (faceName) => {
      const media = mediaMap[faceName];
      if (!media || !media.url) return "";
      if (media.type === "video") {
        return `
          <div class="aab_wc-video-player">
            <video class="aab_wc-video" data-face="${faceName}" muted loop playsinline>
              <source src="${media.url}" type="video/mp4" />
            </video>
          </div>
        `;
      }
      if (media.type === "image") {
        return `<img src="${media.url}" alt="${faceName}" />`;
      }
      return "";
    };

    const faces = [
      { class: "aab_wc-front", name: "front" },
      { class: "aab_wc-back", name: "back" },
      { class: "aab_wc-right", name: "right" },
      { class: "aab_wc-left", name: "left" },
      { class: "aab_wc-top", name: "top" },
      { class: "aab_wc-bottom", name: "bottom" },
    ];

    faces.forEach((face) => {
      const faceEl = document.createElement("div");
      faceEl.className = `aab_wc-face ${face.class}`;
      faceEl.innerHTML = getFaceContent(face.name);
      cube.appendChild(faceEl);
    });

    const videoControl = document.createElement("button");
    videoControl.className = "aab_wc-video-control";
    videoControl.type = "button";
    videoControl.textContent = "Play";

    animContainer.appendChild(cube);
    scene.appendChild(animContainer);
    scene.appendChild(videoControl);
    scrollContainer.appendChild(scene);
    container.appendChild(scrollContainer);

    // Scoped styles ──────────────────────────────────────────────────
    const style = document.createElement("style");
    style.textContent = `
      ${itemClass} { margin: 0; padding: 0; box-sizing: border-box; }
      ${itemClass} .aab_wc-scroll-container { position: relative; z-index: 9999999999; }
      ${itemClass} .aab_wc-scene {
        width: 100%;
        display: flex;
        justify-content: center;
        position: relative;
      }
      ${itemClass} .aab_wc-animation-container {
        position: relative;
        transform-style: preserve-3d;
        perspective: 1000px;
      }
      ${itemClass} .aab_wc-cube {
        width: 100%;
        height: 100%;
        position: relative;
        transform-style: preserve-3d;
        transform: rotateX(-30deg) rotateY(45deg);
      }
      ${itemClass} .aab_wc-face {
        position: absolute;
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        backface-visibility: hidden;
        overflow: hidden;
      }
      ${itemClass} .aab_wc-face img { width: 100%; height: 100%; object-fit: cover; }
      ${itemClass} .aab_wc-front  { transform: translateZ(${cubeMinWidthNum / 2}px); }
      ${itemClass} .aab_wc-back   { transform: rotateY(180deg) translateZ(${cubeMinWidthNum / 2}px); }
      ${itemClass} .aab_wc-right  { transform: rotateY(90deg)  translateZ(${cubeMinWidthNum / 2}px); }
      ${itemClass} .aab_wc-left   { transform: rotateY(-90deg) translateZ(${cubeMinWidthNum / 2}px); }
      ${itemClass} .aab_wc-top    { transform: rotateX(90deg)  translateZ(${cubeMinWidthNum / 2}px); }
      ${itemClass} .aab_wc-bottom { transform: rotateX(-90deg) translateZ(${cubeMinWidthNum / 2}px); }
      ${itemClass} .aab_wc-video-player {
        position: absolute;
        top: 0; left: 0;
        width: 100%; height: 100%;
        overflow: hidden;
      }
      ${itemClass} .aab_wc-video { width: 100%; height: 100%; object-fit: cover; }
      ${itemClass} .aab_wc-video-control {
        position: absolute;
        background: rgba(0, 0, 0, 0.7);
        color: #fff;
        border: none;
        border-radius: 100px;
        padding: 8px 16px;
        cursor: pointer;
        font-size: 12px;
        transition: all 0.3s ease;
        z-index: 10;
        height: 100px;
        width: 100px;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        opacity: 0;
        display: none;
      }
      ${itemClass} .aab_wc-animation-container:hover + .aab_wc-video-control,
      ${itemClass} .aab_wc-video-control:hover { opacity: 1; }
    `;
    container.appendChild(style);

    // Refs ───────────────────────────────────────────────────────────
    const controlBtn = container.querySelector(".aab_wc-video-control");
    const animContainerEl = container.querySelector(
      ".aab_wc-animation-container",
    );
    const cubeEl = container.querySelector(".aab_wc-cube");
    const front = container.querySelector(".aab_wc-front");
    const back = container.querySelector(".aab_wc-back");
    const right = container.querySelector(".aab_wc-right");
    const left = container.querySelector(".aab_wc-left");
    const topFace = container.querySelector(".aab_wc-top");
    const bottom = container.querySelector(".aab_wc-bottom");
    const face = container.querySelectorAll(".aab_wc-face");

    const expandingFaceMedia = mediaMap[expandFace];
    const hasExpandingVideo =
      expandingFaceMedia?.type === "video" && expandingFaceMedia?.url;
    const video = hasExpandingVideo
      ? container.querySelector(`.aab_wc-video[data-face="${expandFace}"]`)
      : null;

    const faceRotations = {
      front: { rotationY: 0, rotationX: 0 },
      back: { rotationY: 180, rotationX: 0 },
      right: { rotationY: -90, rotationX: 0 },
      left: { rotationY: 90, rotationX: 0 },
      top: { rotationY: 0, rotationX: -90 },
      bottom: { rotationY: 0, rotationX: 90 },
    };
    const targetRotation = faceRotations[expandFace] || faceRotations.front;

    const allFaces = [front, back, right, left, topFace, bottom];
    const faceElements = {
      front,
      back,
      right,
      left,
      top: topFace,
      bottom,
    };
    const facesToHide = allFaces.filter(
      (f) => f !== faceElements[expandFace],
    );

    // Measure scroll distance to the end section ─────────────────────
    let endElement = null;
    try {
      endElement = document.querySelector(endSectionClass);
    } catch (err) {
      console.warn(
        `[cubeScroll] invalid endSectionClass "${endSectionClass}":`,
        err.message,
      );
    }

    let endDistance = window.innerHeight * 1.5;
    if (endElement) {
      const containerRect = scrollContainer.getBoundingClientRect();
      const endRect = endElement.getBoundingClientRect();
      const containerTop = containerRect.top + window.scrollY;
      const endTop = endRect.top + window.scrollY;
      endDistance = endTop - containerTop;
    }

    // Main scroll-scrubbed cube timeline ─────────────────────────────
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: scrollContainer,
        start: cubeAnimStart === "custom" ? cubeAnimCStart : cubeAnimStart,
        end: "+=" + endDistance,
        scrub: 1,
        pin: true,
        pinSpacing: false,
      },
    });

    tl.to(animContainerEl, { scale: scaleNum, duration: 0.8 }, 0);
    tl.to(scene, { x: positionNum }, 0);
    tl.to(
      cubeEl,
      {
        rotationY: targetRotation.rotationY,
        rotationX: targetRotation.rotationX,
        rotate: 0,
        duration: 1.3,
      },
      0,
    );
    tl.to(
      animContainerEl,
      {
        width: cubeMaxWidthNum,
        height: cubeMaxHeightNum,
        scale: 1,
        duration: 0.5,
      },
      1.5,
    );
    tl.to(face, { scale: 0.9, duration: 0.8 }, 1.5);
    tl.to(facesToHide, { opacity: 0, duration: 0.5 }, 1.5);

    const scrollTriggers = [];
    const cleanups = [];

    // Video controls for the expanding face ──────────────────────────
    if (hasExpandingVideo && video) {
      tl.to(controlBtn, { display: "block", duration: 0.1 }, 1.5);

      tl.eventCallback("onUpdate", () => {
        if (!video) return;
        if (tl.progress() >= 0.7 && video.paused) {
          video
            .play()
            .catch((err) =>
              console.warn("[cubeScroll] video play failed:", err),
            );
          controlBtn.textContent = "Pause";
        } else if (tl.progress() < 0.7 && !video.paused) {
          video.pause();
          controlBtn.textContent = "Play";
        }
      });

      const videoTrigger = window.ScrollTrigger.create({
        trigger: scrollContainer,
        start: cubeAnimStart === "custom" ? cubeAnimCStart : cubeAnimStart,
        end: "+=" + endDistance,
        onEnter: () => {
          if (tl.progress() >= 0.7 && video) {
            video
              .play()
              .catch((err) =>
                console.warn("[cubeScroll] video play failed:", err),
              );
            controlBtn.textContent = "Pause";
          }
        },
        onEnterBack: () => {
          if (tl.progress() >= 0.7 && video) {
            video
              .play()
              .catch((err) =>
                console.warn("[cubeScroll] video play failed:", err),
              );
            controlBtn.textContent = "Pause";
          }
        },
        onLeave: () => {
          if (video) {
            video.pause();
            controlBtn.textContent = "Play";
          }
        },
        onLeaveBack: () => {
          if (video) {
            video.pause();
            controlBtn.textContent = "Play";
          }
        },
      });
      scrollTriggers.push(videoTrigger);

      const onBtnClick = () => {
        if (video.paused) {
          video.play();
          controlBtn.textContent = "Pause";
        } else {
          video.pause();
          controlBtn.textContent = "Play";
        }
      };
      controlBtn.addEventListener("click", onBtnClick);
      cleanups.push(() =>
        controlBtn.removeEventListener("click", onBtnClick),
      );
    }

    // Teardown: wipe the rebuilt DOM + injected style element.
    cleanups.push(() => {
      container.classList.remove("wcfanimb-skip-selector-full");
      container.innerHTML = "";
    });

    instances.set(id, {
      timelines: [tl],
      scrollTriggers,
      cleanups,
    });
  }

  document.addEventListener("aae-animation-event", handler);
  document.addEventListener("aae-reset-animation", teardownAll);

  return {
    destroy: () =>
      document.dispatchEvent(new CustomEvent("aae-reset-animation")),
  };
}

cubeScrollRevealAnim();
