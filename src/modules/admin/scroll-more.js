/**
 * MotionKit Admin — load the next rows when the page is scrolled to the end of a list.
 *
 * Watches the list's last rendered row against the viewport and calls back when it comes into view (a little before, so the next rows are there by the time the user reaches them). The caller decides whether there is more to load. Returns the function to call after every render, so the new last row is the one watched; null when the browser has no IntersectionObserver, in which case the Load more button stays the way in.
 */
export function watchListEnd(list, rowSelector, onReachEnd) {
  if (!list || typeof IntersectionObserver === "undefined") return null;

  let watched = null;
  const observer = new IntersectionObserver(
    (entries) => {
      if (entries.some((entry) => entry.isIntersecting)) onReachEnd();
    },
    { rootMargin: "0px 0px 240px 0px" }
  );

  return function rewatch() {
    if (watched) observer.unobserve(watched);
    const rows = list.querySelectorAll(rowSelector);
    watched = rows.length ? rows[rows.length - 1] : null;
    if (watched) observer.observe(watched);
  };
}
