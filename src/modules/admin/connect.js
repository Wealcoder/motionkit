// Delegated handlers for the MotionKit admin page — replaces the inline onclick attributes (notice dismiss, disconnect confirm) so the page works under strict admin CSP setups.
(function () {
  function updateConnectButtonState() {
    const checkbox = document.getElementById("motionkit-connect-consent");
    const btn = document.getElementById("motionkit-connect-btn");
    if (checkbox && btn) {
      if (checkbox.checked) {
        btn.removeAttribute("aria-disabled");
        btn.classList.remove("motionkit-btn--disabled");
        btn.style.opacity = "1";
        btn.style.pointerEvents = "auto";
      } else {
        btn.setAttribute("aria-disabled", "true");
        btn.classList.add("motionkit-btn--disabled");
        btn.style.opacity = "0.5";
        btn.style.pointerEvents = "none";
      }
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", updateConnectButtonState);
  } else {
    updateConnectButtonState();
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

  document.addEventListener("change", function (e) {
    if (e.target && e.target.id === "motionkit-connect-consent") {
      updateConnectButtonState();
    }
  });
})();
