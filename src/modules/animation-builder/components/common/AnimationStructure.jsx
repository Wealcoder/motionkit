import {
  addOutlinesToAnimatedElements,
  addElementToAnimations,
  isLikelyAnimatedTarget,
  removeOutlinesFromElements,
  scrollToElement,
  scrollToElementByData,
} from "@/lib/animStructure";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useRef, useState } from "react";
import { Button } from "../ui/button";
import { IconCross } from "../../../../assets/icons";
import { Search, SearchX } from "lucide-react";
import { Input } from "../ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";
import { ScrollArea } from "../ui/scroll-area";
import STAnimNotFound from "../notFound/STAnimNotFound";
import SeAnimNotFound from "../notFound/SeAnimNotFound";

export default function AnimationStructure() {
  const [offPanel, setOffPanel] = useState(true);
  const [showBorder, setShowBorder] = useState(false);
  const [containers, setContainers] = useState([]);
  const [bContainers, setBContainers] = useState([]);
  const [position, setPosition] = useState({ left: 20, top: 60 });
  const [size, setSize] = useState({ width: 263, height: 460 });
  const [gsapFound, setGsapFound] = useState(false);
  const [tabValue, setTabValue] = useState("builder");
  const [isOpenSearch, setIsOpenSearch] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [hoveredAnimation, setHoveredAnimation] = useState(null);

  const panelRef = useRef(null);
  const draggingRef = useRef(false);
  const resizingRef = useRef(false);
  const pointerStart = useRef({ x: 0, y: 0 });
  const startPos = useRef({ left: 0, top: 0 });
  const startSize = useRef({ width: 0, height: 0 });
  const scanAttemptsRef = useRef(0);
  const scanTimeoutRef = useRef(null);
  const maxAttempts = 6;

  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  useEffect(() => {
    if (hoveredAnimation) {
      addOutlinesToAnimatedElements([hoveredAnimation]);
    } else if (showBorder) {
      addOutlinesToAnimatedElements([...containers, ...bContainers]);
    } else {
      removeOutlinesFromElements([...containers, ...bContainers]);
    }

    return () => {
      if (hoveredAnimation) {
        removeOutlinesFromElements([hoveredAnimation]);
      }
    };
  }, [hoveredAnimation, showBorder, containers, bContainers]);

  useEffect(() => {
    function onPointerMove(e) {
      if (draggingRef.current) {
        const dx = e.clientX - pointerStart.current.x;
        const dy = e.clientY - pointerStart.current.y;
        setPosition({
          left: clamp(
            startPos.current.left + dx,
            0,
            window.innerWidth - startSize.current.width
          ),
          top: clamp(
            startPos.current.top + dy,
            0,
            window.innerHeight - startSize.current.height
          ),
        });
      } else if (resizingRef.current) {
        const dy = e.clientY - pointerStart.current.y;
        setSize({
          width: startSize.current.width,
          height: clamp(
            startSize.current.height + dy,
            120,
            window.innerHeight - position.top
          ),
        });
      }
    }
    function onPointerUp() {
      draggingRef.current = false;
      resizingRef.current = false;
    }
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerUp);
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);
    };
  }, [position.top]);

  useEffect(() => {
    const attemptScan = () => {
      if (gsapFound || scanAttemptsRef.current >= maxAttempts) {
        return;
      }
      scanAttemptsRef.current++;
      if (scanGSAP()) {
        setGsapFound(true);
      } else if (scanAttemptsRef.current < maxAttempts)
        scanTimeoutRef.current = setTimeout(
          attemptScan,
          scanAttemptsRef.current <= 3 ? 200 : scanAttemptsRef.current * 800
        );
    };
    scanTimeoutRef.current = setTimeout(attemptScan, 50);
    return () => {
      if (scanTimeoutRef.current) clearTimeout(scanTimeoutRef.current);
      removeOutlinesFromElements();
    };
  }, []);

  useEffect(() => {
    wcf_anim_preview_object?.animation_config?.desktop?.forEach((mainAnim) => {
      if (mainAnim?.type === "custom") {
        mainAnim?.animations?.forEach((anim) =>
          addElementByClassName(
            anim?.applyAnimation?.className,
            mainAnim.id,
            mainAnim.title
          )
        );
      } else if (mainAnim?.type === "preset") {
        addElementByClassName(mainAnim?.itemClass, mainAnim.id, mainAnim.title);
      }
    });

    const structure = localStorage.getItem("aae_selected_structure");
    if (structure) {
      const parsed = structure === "true";
      setOffPanel(parsed);
    }

    const border = localStorage.getItem("aae_selected_border");
    if (border) {
      const parsed = border === "true";
      setShowBorder(parsed);
    }

    const handleMessage = (event) => {
      if (event?.data?.["wcf-animation-config"]) {
        setBContainers([]);
        setTimeout(() => {
          event?.data?.["wcf-animation-config"]?.desktop?.forEach(
            (mainAnim) => {
              if (mainAnim?.type === "custom") {
                mainAnim?.animations?.forEach((anim) =>
                  addElementByClassName(
                    anim?.applyAnimation?.className,
                    mainAnim.id,
                    mainAnim.title
                  )
                );
              } else if (mainAnim?.type === "preset") {
                addElementByClassName(
                  mainAnim?.itemClass,
                  mainAnim.id,
                  mainAnim.title
                );
              }
            }
          );
        }, 0);
      } else if (event?.data?.["wcf-animation-config-reset"]) {
        setBContainers([]);
        setTimeout(() => {
          wcf_anim_preview_object?.animation_config?.desktop?.forEach(
            (mainAnim) => {
              if (mainAnim?.type === "custom") {
                mainAnim?.animations?.forEach((anim) =>
                  addElementByClassName(
                    anim?.applyAnimation?.className,
                    mainAnim.id,
                    mainAnim.title
                  )
                );
              } else if (mainAnim?.type === "preset") {
                addElementByClassName(
                  mainAnim?.itemClass,
                  mainAnim.id,
                  mainAnim.title
                );
              }
            }
          );
        }, 0);
      }
      if (event?.data?.["aae_show_structure"] !== undefined) {
        setOffPanel(event?.data?.["aae_show_structure"]);
      }
      if (event?.data?.["aae_show_border"] !== undefined) {
        console.log("triggered");
        setShowBorder(event?.data?.["aae_show_border"]);
      }
    };

    window.addEventListener("message", handleMessage, false);

    return () => window.removeEventListener("message", handleMessage, false);
  }, []);

  useEffect(() => {
    const handleClick = (e) => {
      const btn = e.target.closest(".ab-setting-action");
      const copyBtn = e.target.closest(".ab-copy-action");

      if (copyBtn) {
        const text = copyBtn.getAttribute("data-selector-copy");
        if (text) {
          const copyWithFallback = (text) => {
            const textarea = document.createElement("textarea");
            textarea.value = text;

            textarea.setAttribute("readonly", "");
            textarea.setAttribute("aria-hidden", "true");
            textarea.style.position = "fixed";
            textarea.style.left = "-9999px";
            textarea.style.top = "0";
            textarea.style.opacity = "0";
            textarea.style.pointerEvents = "none";

            document.body.appendChild(textarea);

            textarea.focus();
            textarea.select();
            textarea.setSelectionRange(0, textarea.value.length);

            let success = false;
            try {
              success = document.execCommand("copy");
            } catch (err) {
              success = false;
            }

            document.body.removeChild(textarea);
            return success;
          };

          const doCopy = async (text) => {
            if (
              navigator.clipboard &&
              window.isSecureContext &&
              navigator.clipboard.writeText
            ) {
              try {
                await navigator.clipboard.writeText(text);
                return true;
              } catch (err) {
                return copyWithFallback(text);
              }
            } else {
              return copyWithFallback(text);
            }
          };

          doCopy(text).then((ok) => {
            copyBtn.classList.add("zoom-effect");
            setTimeout(() => copyBtn.classList.remove("zoom-effect"), 200);

            const prevBg = copyBtn.style.background;
            copyBtn.style.background = "#55B2FF";
            setTimeout(() => {
              copyBtn.style.background = prevBg || "#6C6C6C";
            }, 1500);
          });
        }

        return;
      }

      if (!btn) return;

      const selector = btn.getAttribute("data-selector-target");
      const tab = btn.getAttribute("data-selector-tab");
      const aId = btn.getAttribute("data-selector-aid");

      if (aId) {
        window.parent.postMessage(
          {
            type: "PANEL_ANIMATION_LIST_BUILDER",
            payload: { id: aId },
          },
          "*"
        );
      }

      if (tab) {
        setTabValue(tab);
      }

      if (selector) {
        scrollToElementByData("selector-list", selector);
      }
    };

    document.addEventListener("click", handleClick);

    return () => {
      document.removeEventListener("click", handleClick);
    };
  }, []);

  const onHeaderPointerDown = (e) => {
    e.preventDefault();
    draggingRef.current = true;
    pointerStart.current = { x: e.clientX, y: e.clientY };
    startPos.current = { ...position };
    startSize.current = { ...size };
    panelRef.current?.setPointerCapture?.(e.pointerId);
  };

  const onResizePointerDown = (e) => {
    e.preventDefault();
    resizingRef.current = true;
    pointerStart.current = { x: e.clientX, y: e.clientY };
    startSize.current = { ...size };
    startPos.current = { ...position };
    panelRef.current?.setPointerCapture?.(e.pointerId);
  };

  const scanGSAP = () => {
    const animations = [...containers];
    const seenSelectors = new Set(animations.map((a) => a.selector));
    const counterRef = { current: animations.length + 1 };

    try {
      const uniqueTargets = new Set();

      if (window.gsap) {
        const children = window.gsap.globalTimeline.getChildren(
          true,
          true,
          true
        );

        children.forEach((tween) => {
          let targets = [];
          if (typeof tween.targets === "function") {
            targets = tween.targets();
          } else if (Array.isArray(tween.targets)) {
            targets = tween.targets;
          } else if (Array.isArray(tween._targets)) {
            targets = tween._targets;
          }

          targets.forEach((el) => {
            if (el && el.nodeType === 1 && isLikelyAnimatedTarget(el)) {
              const ariaAncestor = el.closest?.("[aria-label]");
              uniqueTargets.add(ariaAncestor || el);
            }
          });
        });
      }

      document
        .querySelectorAll(
          '[style*="transform"], [style*="translate"], [style*="matrix"], [style*="opacity"]'
        )
        .forEach((el) => {
          if (isLikelyAnimatedTarget(el)) {
            const ariaAncestor = el.closest?.("[aria-label]");
            uniqueTargets.add(ariaAncestor || el);
          }
        });

      uniqueTargets.forEach((el) =>
        addElementToAnimations({
          el,
          animations,
          seenSelectors,
          counterRef,
          context: "Animation",
        })
      );
    } catch (e) {
      console.warn("GSAP scan error:", e);
    }

    setContainers(animations);

    return animations.length > 0;
  };

  const addElementByClassName = (className, aId, aTitle) => {
    const el = document.querySelector(className);
    if (!el) {
      console.warn(`No element found with class "${className}"`);
      return;
    }

    setBContainers((prevBContainers) => {
      const animations = [...prevBContainers];
      const seenSelectors = new Set(animations.map((a) => a.selector));
      const counterRef = { current: animations.length + 1 };

      addElementToAnimations({
        el,
        animations,
        seenSelectors,
        counterRef,
        animType: "builder",
        aId,
        aTitle,
      });

      return animations;
    });
  };

  const getFilteredContainers = () => {
    if (!searchText.trim()) return bContainers;

    return bContainers.filter((container) =>
      container.name.toLowerCase().includes(searchText.toLowerCase())
    );
  };

  if (!offPanel) return null;

  return (
    <div className="wcfab2025">
      <div
        ref={panelRef}
        className="fixed bg-background text-text rounded-[10px] flex flex-col overflow-hidden z-[999999] select-auto wcfanimb-skip-selector-full"
        style={{
          left: position.left,
          top: position.top,
          width: size.width,
          height: size.height,
        }}
      >
        <div className="flex items-center justify-between py-[8px] px-[12px] border-b-[1px] cursor-grab gap-[8px] w-full">
          <div
            className="flex items-center gap-[8px]"
            onPointerDown={onHeaderPointerDown}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
            >
              <rect
                width="16"
                height="16"
                rx="4"
                fill="url(#paint0_linear_11001_3964)"
              />
              <path
                d="M11.1902 9.65332C11.2074 9.68594 11.2165 9.72289 11.2156 9.75977C11.2146 9.79656 11.2041 9.83264 11.1853 9.86426C11.1664 9.89592 11.1392 9.92211 11.1072 9.94043C11.0752 9.95875 11.0386 9.96849 11.0017 9.96875H8.29956L8.71362 9.76465C8.78952 9.73161 8.85795 9.68325 8.91479 9.62305C8.97163 9.56285 9.01601 9.49175 9.04468 9.41406C9.07334 9.33627 9.08597 9.25273 9.08179 9.16992C9.07757 9.08721 9.05659 9.00606 9.02026 8.93164L8.66089 8.19531C8.64327 8.15903 8.61596 8.12783 8.58179 8.10645C8.54781 8.08529 8.50852 8.07427 8.46851 8.07422H7.24097L8.65503 10.9766C8.67583 11.0188 8.68726 11.0652 8.68726 11.1123C8.68723 11.1594 8.67589 11.2058 8.65503 11.248L7.93433 12.6875L4.58276 6.34668C4.56541 6.31393 4.55637 6.27729 4.55737 6.24023C4.55839 6.20326 4.56958 6.16745 4.58862 6.13574C4.60774 6.10398 4.63448 6.07682 4.66675 6.05859C4.6989 6.0405 4.73533 6.03125 4.77222 6.03125H7.44116L7.05933 6.23633C6.98333 6.26937 6.91408 6.31766 6.85718 6.37793C6.80044 6.43808 6.7569 6.50932 6.72827 6.58691C6.69964 6.66462 6.68702 6.74737 6.69116 6.83008C6.69534 6.91268 6.71551 6.99401 6.75171 7.06836L7.11401 7.81152C7.13166 7.84772 7.15898 7.87906 7.19312 7.90039C7.22729 7.92172 7.2671 7.93267 7.30737 7.93262H8.53394L7.11694 5.02344C7.09637 4.98113 7.08546 4.93475 7.08569 4.8877C7.08596 4.84052 7.09777 4.79413 7.1189 4.75195L7.83862 3.3125L11.1902 9.65332ZM5.35034 9.96875H3.84058C3.81139 9.96866 3.78311 9.9601 3.75854 9.94434C3.73399 9.92855 3.71414 9.90639 3.7019 9.87988C3.68968 9.85324 3.68517 9.82298 3.68921 9.79395C3.69331 9.7651 3.70545 9.73797 3.72437 9.71582L4.64331 8.64453L5.35034 9.96875ZM12.0046 8.8877C12.1747 8.8877 12.3132 9.0257 12.3132 9.19531C12.3131 9.36484 12.1746 9.50195 12.0046 9.50195C11.8348 9.5018 11.6971 9.36475 11.697 9.19531C11.697 9.02579 11.8347 8.88785 12.0046 8.8877ZM11.7742 6.85059C12.0716 6.85059 12.3123 7.092 12.3123 7.38867C12.312 7.68513 12.0714 7.92578 11.7742 7.92578H11.5369C11.2396 7.92575 10.999 7.68511 10.9988 7.38867C10.9988 7.09202 11.2395 6.85062 11.5369 6.85059H11.7742ZM11.7742 4.66504C12.0715 4.66509 12.3123 4.90551 12.3123 5.20215C12.3122 5.49876 12.0715 5.7392 11.7742 5.73926H10.4656C10.1682 5.73926 9.92654 5.4988 9.92651 5.20215C9.92651 4.90548 10.1682 4.66504 10.4656 4.66504H11.7742Z"
                fill="white"
              />
              <defs>
                <linearGradient
                  id="paint0_linear_11001_3964"
                  x1="16"
                  y1="0"
                  x2="1.90735e-06"
                  y2="16"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop offset="0.100407" stop-color="#F12529" />
                  <stop offset="0.901072" stop-color="#FFA030" />
                </linearGradient>
              </defs>
            </svg>
            <div>
              <span className="text-[14px] font-medium">Animation </span>
              <span className="text-[9px] text-[#DADADA]">
                (All {containers.length + bContainers.length} Animation)
              </span>
            </div>
          </div>
          <Button
            className="h-[14px] w-[14px] bg-transparent hover:bg-transparent [&_svg]:size-[10px]"
            onClick={() => {
              setOffPanel(false);
              localStorage.setItem("aae_selected_structure", false);
              window.parent.postMessage(
                {
                  type: "PANEL_STRUCTURE",
                  payload: { value: false },
                },
                "*"
              );
            }}
          >
            <IconCross size="10" />
          </Button>
        </div>

        <div className="ps-[12px] border-b-[1px]">
          <Tabs value={tabValue} onValueChange={setTabValue}>
            <div className="flex items-center justify-between w-full py-[16px] pe-[12px]">
              <TabsList className="w-[152px] rounded-[4px]">
                <TabsTrigger
                  value={"builder"}
                  className="py-[6px] px-[8px] w-full text-[12px] h-[28px]"
                >
                  Builder
                </TabsTrigger>
                <TabsTrigger
                  value={"template"}
                  className="py-[6px] px-[8px] w-full text-[12px] h-[28px]"
                >
                  Template
                </TabsTrigger>
              </TabsList>

              {tabValue === "builder" && (
                <Button
                  className="h-[28px] w-[28px] bg-transparent hover:bg-border-2 border-[1px] border-border-2 px-0 py-0 [&_svg]:size-[14px] rounded-[4px]"
                  onClick={() => setIsOpenSearch((prev) => !prev)}
                >
                  {isOpenSearch ? (
                    <SearchX size={14} color="#D5D8DC" />
                  ) : (
                    <Search size={14} color="#D5D8DC" />
                  )}
                </Button>
              )}
            </div>

            <TabsContent
              value={"builder"}
              className="mt-0 flex flex-col gap-[16px] pe-[4px]"
            >
              {isOpenSearch ? (
                <div className="flex items-center gap-[8px] px-[6px] border-[1px] border-border-2 rounded-[4px] me-[8px]">
                  <Button className="h-[14px] w-[14px] bg-transparent hover:bg-transparent [&_svg]:size-[14px] cursor-default">
                    <Search size="14" color="#D5D8DC" />
                  </Button>

                  <Input
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    placeholder="Search your animation ..."
                    className="border-0 p-0 text-[13px] placeholder:text-text-2"
                  />
                  {searchText.length > 0 && (
                    <Button
                      className="h-[14px] w-[14px] bg-transparent hover:bg-transparent [&_svg]:size-[14px]"
                      onClick={() => setSearchText("")}
                    >
                      <IconCross size="14" color="#D5D8DC" />
                    </Button>
                  )}
                </div>
              ) : (
                <></>
              )}
              <ScrollArea
                style={{
                  height: size.height - 130,
                }}
                className="pe-[8px] mb-[10px]"
                viewportClassName="ab-sidebar-scroll-viewport"
              >
                {getFilteredContainers()?.length ? (
                  <Accordion type="single" collapsible defaultValue="item-1">
                    <AccordionItem value="item-1">
                      <AccordionTrigger className="justify-start gap-[6px] ">
                        <div className="flex items-center gap-[6px]">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="14"
                            height="14"
                            viewBox="0 0 14 14"
                            fill="none"
                          >
                            <g clip-path="url(#clip0_11001_3995)">
                              <path
                                d="M2.26981 11.7303C1.45825 10.9187 1.45825 9.6125 1.45825 7.00016C1.45825 4.3878 1.45825 3.08162 2.26981 2.27005C3.08137 1.4585 4.38755 1.4585 6.99992 1.4585C9.61226 1.4585 10.9185 1.4585 11.7301 2.27005C12.5416 3.08161 12.5416 4.3878 12.5416 7.00016C12.5416 9.6125 12.5416 10.9187 11.7301 11.7303C10.9185 12.5418 9.61226 12.5418 6.99992 12.5418C4.38755 12.5418 3.08137 12.5418 2.26981 11.7303Z"
                                stroke="#ffffff"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                              />
                              <path
                                d="M1.45825 5.25H12.5416"
                                stroke="#ffffff"
                              />
                              <path d="M7 12.5417V5.25" stroke="#ffffff" />
                            </g>
                            <defs>
                              <clipPath id="clip0_11001_3995">
                                <rect width="14" height="14" fill="white" />
                              </clipPath>
                            </defs>
                          </svg>
                          <span className="text-[12px] text-text font-normal">
                            Body
                          </span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="pt-[16px] pl-[20px] flex flex-col gap-[12px] ab-builder-list-item">
                          {getFilteredContainers()?.map((animation, i) => (
                            <div
                              key={i}
                              onClick={() => {
                                scrollToElement(animation);
                                if (animation?.aId) {
                                  window.parent.postMessage(
                                    {
                                      type: "PANEL_ANIMATION_LIST_BUILDER",
                                      payload: { id: animation.aId },
                                    },
                                    "*"
                                  );
                                }
                              }}
                              onMouseEnter={() =>
                                setHoveredAnimation(animation)
                              }
                              onMouseLeave={() => setHoveredAnimation(null)}
                              className={`flex items-center gap-[6px] cursor-pointer h-[16px] group`}
                              data-selector-list={animation.selector}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="14"
                                height="14"
                                viewBox="0 0 14 14"
                                fill="none"
                                className="stroke-text-2 group-hover:stroke-[#FF8800]"
                              >
                                <path
                                  d="M5.47268 2.91962C6.17748 2.13988 6.52993 1.75 6.99992 1.75C7.46991 1.75 7.82236 2.13988 8.52714 2.91962L10.2606 4.83731C11.1979 5.87428 11.6666 6.39281 11.6666 7C11.6666 7.60719 11.1979 8.12572 10.2606 9.16271L8.52714 11.0804C7.82236 11.8601 7.46991 12.25 6.99992 12.25C6.52993 12.25 6.17748 11.8601 5.47268 11.0804L3.73927 9.16271C2.80193 8.12572 2.33325 7.60719 2.33325 7C2.33325 6.39281 2.80193 5.87428 3.73927 4.83731L5.47268 2.91962Z"
                                  stroke=""
                                />
                              </svg>
                              <p
                                className={`text-[12px] text-text-2 group-hover:text-[#FF8800]`}
                              >
                                {animation.name}
                              </p>
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                ) : (
                  <>{searchText ? <SeAnimNotFound /> : <STAnimNotFound />}</>
                )}
              </ScrollArea>
            </TabsContent>
            <TabsContent
              value="template"
              className="mt-0 flex flex-col gap-[16px] pe-[4px]"
            >
              <ScrollArea
                style={{
                  height: size.height - 130,
                }}
                className="pe-[8px] mb-[10px]"
                viewportClassName="ab-sidebar-scroll-viewport"
              >
                <Accordion type="single" collapsible defaultValue="item-1">
                  <AccordionItem value="item-1">
                    <AccordionTrigger className="justify-start gap-[6px] ">
                      <div className="flex items-center gap-[6px]">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="14"
                          height="14"
                          viewBox="0 0 14 14"
                          fill="none"
                        >
                          <g clip-path="url(#clip0_11001_3995)">
                            <path
                              d="M2.26981 11.7303C1.45825 10.9187 1.45825 9.6125 1.45825 7.00016C1.45825 4.3878 1.45825 3.08162 2.26981 2.27005C3.08137 1.4585 4.38755 1.4585 6.99992 1.4585C9.61226 1.4585 10.9185 1.4585 11.7301 2.27005C12.5416 3.08161 12.5416 4.3878 12.5416 7.00016C12.5416 9.6125 12.5416 10.9187 11.7301 11.7303C10.9185 12.5418 9.61226 12.5418 6.99992 12.5418C4.38755 12.5418 3.08137 12.5418 2.26981 11.7303Z"
                              stroke="#ffffff"
                              stroke-linecap="round"
                              stroke-linejoin="round"
                            />
                            <path d="M1.45825 5.25H12.5416" stroke="#ffffff" />
                            <path d="M7 12.5417V5.25" stroke="#ffffff" />
                          </g>
                          <defs>
                            <clipPath id="clip0_11001_3995">
                              <rect width="14" height="14" fill="white" />
                            </clipPath>
                          </defs>
                        </svg>
                        <span className="text-[12px] text-text font-normal">
                          Body
                        </span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="pt-[16px] pl-[20px] flex flex-col gap-[12px] ab-template-list-item">
                        {containers?.map((animation, i) => (
                          <div
                            key={i}
                            onClick={() => scrollToElement(animation)}
                            onMouseEnter={() => setHoveredAnimation(animation)}
                            onMouseLeave={() => setHoveredAnimation(null)}
                            className={`flex items-center gap-[6px] cursor-pointer h-[16px] group`}
                            data-selector-list={animation.selector}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              viewBox="0 0 16 16"
                              fill="none"
                              className="stroke-text-2 group-hover:stroke-[#21E23D]"
                            >
                              <g clip-path="url(#clip0_11001_4143)">
                                <path
                                  d="M8 13.3335V14.6668"
                                  stroke=""
                                  stroke-linecap="round"
                                  stroke-linejoin="round"
                                />
                                <path
                                  d="M8.54401 11.0532C8.40601 11.2312 8.20801 11.3332 8.00001 11.3332C7.79201 11.3332 7.59334 11.2312 7.45601 11.0532L5.51734 8.5545C5.39767 8.39434 5.33301 8.19977 5.33301 7.99984C5.33301 7.7999 5.39767 7.60533 5.51734 7.44517L7.45601 4.9465C7.59401 4.7685 7.79201 4.6665 8.00001 4.6665C8.20801 4.6665 8.40668 4.7685 8.54401 4.9465L10.4827 7.44517C10.6023 7.60533 10.667 7.7999 10.667 7.99984C10.667 8.19977 10.6023 8.39434 10.4827 8.5545L8.54401 11.0532Z"
                                  stroke=""
                                  stroke-linecap="round"
                                  stroke-linejoin="round"
                                />
                                <path
                                  d="M8 1.3335V2.66683"
                                  stroke=""
                                  stroke-linecap="round"
                                  stroke-linejoin="round"
                                />
                                <path
                                  d="M2 8H3.33333"
                                  stroke=""
                                  stroke-linecap="round"
                                  stroke-linejoin="round"
                                />
                                <path
                                  d="M12.6667 8H14.0001"
                                  stroke=""
                                  stroke-linecap="round"
                                  stroke-linejoin="round"
                                />
                              </g>
                              <defs>
                                <clipPath id="clip0_11001_4143">
                                  <rect width="16" height="16" fill="white" />
                                </clipPath>
                              </defs>
                            </svg>
                            <p
                              className={`text-[12px] text-text-2 group-hover:text-[#21E23D]`}
                            >
                              {animation.name}
                            </p>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>

        <div
          onPointerDown={onResizePointerDown}
          className="h-[16px] cursor-ns-resize flex items-center justify-center"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="17"
            height="16"
            viewBox="0 0 17 16"
            fill="none"
          >
            <path
              d="M8.49731 8H8.50846"
              stroke="#D5D8DC"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M12.4998 8H12.5109"
              stroke="#D5D8DC"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M4.49976 8H4.51087"
              stroke="#D5D8DC"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
