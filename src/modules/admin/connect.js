// Delegated handlers for the MotionKit admin page — replaces the inline onclick attributes (notice dismiss, disconnect confirm) so the page works under strict admin CSP setups.
(function () {
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
