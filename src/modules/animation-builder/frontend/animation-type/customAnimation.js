import { extractNameAndValue, resetAnimations } from "../animationUtils";

export function customAnimation() {
  const timelines = {};
  const createdScrollTriggers = [];
  let config = [];
  document.addEventListener("aae-animation-event", (e) => {
    const formattedConfig = e.detail || {};
    config = formattedConfig["custom"];
    formattedConfig["custom"]?.forEach((section) => {
      const scrollConfig = section.ScrollTrigger;
      section.timelines?.forEach((timeline) => {
        const config = timeline?.properties?.reduce((acc, prop) => {
          if (!prop.isError) {
            acc[prop.name] = prop.unit
              ? `${prop.value}${prop.unit}`
              : prop.value;
          }
          return acc;
        }, {});
        const createTimeline = gsap.timeline(config);
        timelines[timeline.id] = createTimeline;
      });

      section.animations?.forEach((animation) => {
        const timeline = timelines[animation.timeline];
        if (
          animation.applyAnimation.className &&
          animation.applyAnimation.className !== ""
        ) {
          const findDrawSVG = animation?.properties?.find(
            (el) => el.name === "drawSVG" && el.value
          );

          const targetElement = document.querySelector(
            animation.applyAnimation.className
          );

          if (!targetElement) {
            console.warn(`Target not found for animation: ${animation.title}`);
            return;
          }

          gsap.set(animation.applyAnimation.className, {
            transition: "none",
          });

          // targetElement.style.transition = "none";
          // 👉 If drawSVG exists
          if (findDrawSVG) {
            let container = null;

            const selector =
              `path, circle, rect, line, polyline, polygon, ellipse, textPath`.trim();

            // First: check if target is inside an SVG (go upward)
            if (targetElement.closest("svg")) {
              container = targetElement.closest("svg");
            }

            // Second: if not found going upward, search inside (go downward)
            if (!container) {
              container = targetElement.querySelector("svg");
            }

            // If still not found, give up
            if (!container || container.tagName.toLowerCase() !== "svg") {
              console.warn("DrawSVG: No SVG container found");
              return;
            }

            // Find relevant SVG elements inside container
            let elems = container.querySelectorAll(selector);
            if (elems.length === 0) {
              console.warn("DrawSVG: no SVG elements found for", selector);
              return;
            }

            // Function to split complex paths
            function splitPaths(paths) {
              let toSplit = gsap.utils.toArray(paths);
              let newPaths = [];

              toSplit.forEach((element) => {
                const tag = element.tagName.toLowerCase();

                if (
                  tag === "circle" ||
                  tag === "rect" ||
                  tag === "ellipse" ||
                  tag === "line" ||
                  tag === "textpath"
                ) {
                  newPaths.push(element);
                  return;
                }

                if (tag === "path" || tag === "polyline" || tag === "polygon") {
                  const rawPath = MotionPathPlugin.getRawPath(element);
                  const parent = element.parentNode;
                  const attributes = Array.from(element.attributes);

                  if (!rawPath || rawPath.length === 0) return;

                  rawPath.forEach((segment) => {
                    const newPath = document.createElementNS(
                      "http://www.w3.org/2000/svg",
                      "path"
                    );

                    attributes.forEach((attr) =>
                      newPath.setAttribute(attr.name, attr.value)
                    );

                    newPath.setAttribute(
                      "d",
                      `M${segment[0]},${segment[1]}C${segment
                        .slice(2)
                        .join(",")}${segment.closed ? "z" : ""}`
                    );

                    parent.insertBefore(newPath, element);
                    newPaths.push(newPath);
                  });

                  parent.removeChild(element);
                }
              });

              return newPaths;
            }

            const paths = splitPaths(elems);

            const totalLength = paths.reduce(
              (sum, path) => sum + path.getTotalLength(),
              0
            );

            const method = animation.method || "to";

            paths.forEach((path, index) => {
              const pathLength = path.getTotalLength();
              const position = animation.absoluteTime || index * 0.1;

              const properties = animation?.properties?.reduce((acc, prop) => {
                if (prop.type === "custom") {
                  const customArr = prop.value.split(",");
                  customArr.forEach((cItem) => {
                    if (cItem !== "") {
                      const [key, value] = cItem.split(":");
                      if (key && value) acc[key.trim()] = value.trim();
                    }
                  });
                } else if (prop.name === "duration") {
                  const pathDuration =
                    parseFloat(prop.value) * (pathLength / totalLength);
                  acc.duration = pathDuration;
                } else if (!prop.isError) {
                  acc[prop.name] = prop.unit
                    ? `${prop.value}${prop.unit}`
                    : prop.value;
                }
                return acc;
              }, {});
              timeline[method](path, properties, position);
            });
          } else {
            const properties = animation?.properties?.reduce((acc, prop) => {
              if (prop.type === "custom") {
                const customArr = prop.value.split(",");
                customArr.forEach((cItem) => {
                  if (cItem !== "") {
                    const [key, value] = cItem.split(":");
                    if (key && value) acc[key.trim()] = value.trim();
                  }
                });
              } else if (!prop.isError) {
                acc[prop.name] = prop.unit
                  ? `${prop.value}${prop.unit}`
                  : prop.value;
              }

              return acc;
            }, {});

            let split;
            if (animation?.splitText?.enable) {
              function toBoolean(value) {
                return typeof value === "string"
                  ? value.toLowerCase() === "true"
                  : Boolean(value);
              }

              const config = {};
              animation?.splitText?.type
                ? (config.type = animation?.splitText?.type)
                : "";

              const maskVal = animation?.splitText?.mask;

              if (maskVal === "true" || maskVal === "false") {
                config.mask = toBoolean(maskVal);
              } else if (typeof maskVal === "string") {
                config.mask = maskVal;
              }

              animation?.splitText?.propIndex
                ? (config.propIndex = toBoolean(
                    animation?.splitText?.propIndex
                  ))
                : "";
              animation?.splitText?.autoSplit
                ? (config.autoSplit = toBoolean(
                    animation?.splitText?.autoSplit
                  ))
                : "";
              animation?.splitText?.charsClass
                ? (config.charsClass = animation?.splitText?.charsClass)
                : "";
              animation?.splitText?.wordsClass
                ? (config.wordsClass = animation?.splitText?.wordsClass)
                : "";
              animation?.splitText?.linesClass
                ? (config.linesClass = animation?.splitText?.linesClass)
                : "";
              animation?.splitText?.smartWrap
                ? (config.smartWrap = toBoolean(
                    animation?.splitText?.smartWrap
                  ))
                : "";
              animation?.splitText?.ignore
                ? (config.ignore = animation?.splitText?.ignore)
                : "";

              split = new SplitText(animation.applyAnimation.className, config);
              timeline.split = split;
            }
            const method = animation.method || "to";

            const target =
              animation?.splitText?.enable && split[animation?.splitText?.type]
                ? split[animation?.splitText?.type]
                : animation.applyAnimation.className;

            if (method === "fromTo") {
              timeline[method](
                target,
                { x: -100 },
                properties,
                animation.absoluteTime || undefined
              );
            } else {
              timeline[method](
                target,
                properties,
                animation.absoluteTime || undefined
              );
            }
          }
        }
      });

      // Scroll Trigger
      if (scrollConfig?.enable && scrollConfig.enable) {
        const scrolTime = timelines[scrollConfig.timeline];
        if (scrolTime && ScrollTrigger) {
          gsap.set(scrollConfig.trigger, {
            transition: "none",
          });

          const final_scroll_configs = {
            animation: scrolTime,
            trigger: scrollConfig.trigger,
          };

          if (scrollConfig.endTrigger) {
            final_scroll_configs.endTrigger = scrollConfig.endTrigger;
          }

          if (scrollConfig.start || scrollConfig.customStart) {
            final_scroll_configs.start =
              scrollConfig.start === "custom"
                ? scrollConfig.customStart
                : scrollConfig.start;
          }

          if (scrollConfig.end || scrollConfig.customEnd) {
            final_scroll_configs.end =
              scrollConfig.end === "custom"
                ? scrollConfig.customEnd
                : scrollConfig.end;
          }

          if (scrollConfig.scrub || scrollConfig.customScrub) {
            final_scroll_configs.scrub =
              scrollConfig.scrub === "true"
                ? true
                : scrollConfig.scrub === "false"
                ? false
                : scrollConfig.customScrub;
          }

          if (scrollConfig.pin || scrollConfig.customPin) {
            final_scroll_configs.pin =
              scrollConfig.pin === "true"
                ? true
                : scrollConfig.pin === "false"
                ? false
                : scrollConfig.customPin;
          }

          if (scrollConfig.pinSpacing) {
            final_scroll_configs.pinSpacing =
              scrollConfig.pinSpacing === "true";
          }

          const extraprops = extractNameAndValue(scrollConfig.properties);
          extraprops.forEach((pinprop) => {
            if (pinprop.name === "markers") {
              final_scroll_configs.markers = pinprop.value === "true";
            }
            if (pinprop.name === "anticipate pin") {
              final_scroll_configs.pinAnticipate =
                parseInt(pinprop.value, 10) || 0;
            }
            if (pinprop.name === "pinned container") {
              final_scroll_configs.pinContainer = pinprop.value || null;
            }
            if (pinprop.name === "pin type") {
              final_scroll_configs.pinType = pinprop.value || "fixed";
            }
            if (pinprop.name === "custom") {
              const ccustomArr = pinprop.value.split(",");
              if (ccustomArr.length) {
                ccustomArr.forEach((cItem) => {
                  if (cItem != "") {
                    const SplcItem = cItem.split(":");
                    if (SplcItem.length > 1) {
                      final_scroll_configs[SplcItem[0].trim()] =
                        SplcItem[1].trim();
                    }
                  }
                });
              }
            }
          });

          const st = ScrollTrigger.create(final_scroll_configs);

          createdScrollTriggers.push(st);
        }
      }
    });
  });

  document.addEventListener("aae-reset-animation", () => {
    resetAnimations({ config, timelines, createdScrollTriggers });
  });
}

customAnimation();
