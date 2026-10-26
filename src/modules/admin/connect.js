// Delegated handlers for the MotionKit admin page — replaces the inline onclick attributes (notice dismiss, disconnect confirm) so the page works under strict admin CSP setups.
(function () {
  // Back to top: the lists load as they are scrolled, so the top gets far away. The button appears once the first screen is behind, and the scroll listener is throttled to a frame.
  const toTop = document.getElementById("motionkit-to-top");
  if (toTop) {
    const SHOW_AFTER = 480;
    let ticking = false;
    const update = () => {
      toTop.classList.toggle("motionkit-to-top--show", window.scrollY > SHOW_AFTER);
      ticking = false;
    };
    window.addEventListener(
      "scroll",
      () => {
        if (ticking) return;
        ticking = true;
        window.requestAnimationFrame(update);
      },
      { passive: true }
    );
    update();
    toTop.addEventListener("click", () => {
      const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
    });
  }

  document.addEventListener("click", function (e) {
    const close = e.target.closest(".motionkit-notice-close");
    if (close && close.parentElement) {
      close.parentElement.remove();
      return;
    }

    const confirmLink = e.target.closest("[data-motionkit-confirm]");
    if (confirmLink) {
      const message = confirmLink.getAttribute("data-motionkit-confirm");
      if (message && !window.confirm(message)) {
        e.preventDefault();
      }
    }
  });
})();
