import { runPreloader } from "./preloaderEngine/index.js";

// Preloader entry point.
//
// Standalone by design — this does NOT listen to `aae-animation-event` the way
// customAnimation.js does. That channel carries per-element animations; a preloader is a
// page-level singleton with its own lifecycle, and coupling it to the animation
// dispatcher would mean it could not run until frontend.js had booted.
//
// Runs immediately rather than on DOMContentLoaded: the whole point is to be on screen
// while the document is still parsing. dom.js appends to documentElement precisely so
// this works before <body> exists.
runPreloader();
