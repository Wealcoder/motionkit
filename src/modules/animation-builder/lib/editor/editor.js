export function disableIframeLinks() {
  const iframe = document.getElementById(
    "wcf--animation-builder--animation--preview"
  );
  iframe.onload = function () {
    const iframeDocument =
      iframe.contentDocument || iframe.contentWindow.document;

    const links = iframeDocument.querySelectorAll("a");

    links.forEach((link) => {
      link.addEventListener("click", function (event) {
        event.preventDefault();
      });
    });
  };
}
