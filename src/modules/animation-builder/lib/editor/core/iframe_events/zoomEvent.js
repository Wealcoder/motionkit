const storeState = {
  maxZoom: 1.5,
  minZoom: 0.7,
  zoom: 1,
  xplacement: 0,
};

export function handleIframeZoom(event) {
  if (event.shiftKey) {
    event.preventDefault();
    event.stopPropagation();
    storeState.xplacement += event.deltaY < 0 ? 10 : -10;
    window.parent.postMessage(
      {
        type: "WCF_AB_WHEEL_EVENT_X_PLACEMENT",
        value: storeState.xplacement,
      },
      "*"
    );
  } else if (event.ctrlKey) {
    event.preventDefault();
    storeState.zoom += event.deltaY < 0 ? 0.1 : -0.1;
    storeState.zoom = Math.min(
      storeState.maxZoom,
      Math.max(storeState.minZoom, Number(storeState.zoom.toFixed(2)))
    );
    window.parent.postMessage(
      {
        type: "WCF_AB_WHEEL_EVENT",
        value: storeState.zoom,
      },
      "*"
    );
  }
}
