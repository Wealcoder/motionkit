export function scrollVideoFrame() {
  let sTimeline = {};
  let sContainerClass = [];
  let sItemClass = [];
  const handler = (e) => {
    (e.detail["wcf-scroll-video-animation"] || []).forEach((section) => {
      const { containerClass, containerHeight, itemClass } = section || {};
      sContainerClass.push(containerClass);
      sItemClass.push(itemClass);

      if (!containerClass && !containerHeight && !itemClass) return;

      gsap.set(containerClass, {
        height: containerHeight,
        transition: "none",
      });
      gsap.set(itemClass, { maxHeight: "100vh" });

      const video = document.querySelector(itemClass);
      let src = video.currentSrc || video.src;

      const videoScrollTL = gsap.timeline({
        defaults: { duration: 1 },
        scrollTrigger: {
          trigger: containerClass,
          pin: true,
          start: "top top",
          end: "bottom bottom",
          scrub: true,
          pinSpacing: false,
        },
      });

      sTimeline[section.id] = videoScrollTL;

      /* Make sure the video is 'activated' on iOS */
      function once(el, event, fn, opts) {
        var onceFn = function (e) {
          el.removeEventListener(event, onceFn);
          fn.apply(this, arguments);
        };
        el.addEventListener(event, onceFn, opts);
        return onceFn;
      }

      once(document.documentElement, "touchstart", function (e) {
        video.play();
        video.pause();
      });

      once(video, "loadedmetadata", function () {
        videoScrollTL.to(video, {
          currentTime: video.duration,
          ease: "none",
        });
      });

      setTimeout(function () {
        if (window["fetch"]) {
          fetch(src)
            .then((response) => response.blob())
            .then((response) => {
              var blobURL = URL.createObjectURL(response);

              var t = video.currentTime;
              once(document.documentElement, "touchstart", function (e) {
                video.play();
                video.pause();
              });

              video.setAttribute("src", blobURL);
              video.currentTime = t + 0.01;
            });
        }
      }, 1000);
    });
  };

  function removeAnimation() {
    for (let x in sTimeline) {
      sTimeline[x].revert();
      sTimeline[x].kill();
    }

    sContainerClass?.forEach((containerClass) => {
      gsap.set(containerClass, { clearProps: "all" });
    });

    sItemClass?.forEach((itemClass) => {
      gsap.set(itemClass, { clearProps: "all" });
    });
  }

  document.addEventListener("aae-animation-event", handler);

  document.addEventListener("aae-reset-animation", removeAnimation);
}

scrollVideoFrame();
