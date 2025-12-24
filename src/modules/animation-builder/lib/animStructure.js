import { getFullSelector } from "@/lib/animationUtils";

// Border management
export const addOutlinesToAnimatedElements = (animations) => {
  animations.forEach((animation) => {
    if (!animation.el) return;

    const outlineStyle =
      animation.animType === "builder"
        ? "1px solid #F80"
        : "1px dashed #21E23D";

    // save original outline so we can restore it later
    if (!animation.el.dataset.originalOutline) {
      animation.el.dataset.originalOutline = animation.el.style.outline || "";
    }

    animation.el.style.setProperty("outline", outlineStyle, "important");
    animation.el.style.setProperty("outline-offset", "2px", "important"); // optional: pushes outline outward
  });
};

export const removeOutlinesFromElements = () => {
  document.querySelectorAll("[data-original-outline]").forEach((el) => {
    try {
      el.style.outline = el.dataset.originalOutline || "";
    } catch {}
    delete el.dataset.originalOutline;
  });
};

// Animation detection helpers
export const isLikelyAnimatedTarget = (el) => {
  const skipTags = ["body", "html", "main", "header", "footer", "nav"];
  const skipClasses = ["wcf-cursor", "wcf-cursor-follower"];
  const skipIds = ["smooth-content"];

  try {
    const style = window.getComputedStyle(el);
    const inline = el.style;
    const tag = el.tagName.toLowerCase();

    if (skipTags.includes(tag)) return null;

    if ([...el.classList].some((cls) => skipClasses.includes(cls))) return null;

    if (el.id && skipIds.includes(el.id)) return null;

    if (el._gsap || el._gsTransform || el.hasAttribute("data-gsap"))
      return true;

    if (inline.cssText) {
      if (
        (inline.cssText.includes("transform") &&
          !inline.cssText.includes("text-transform")) ||
        inline.cssText.includes("translate") ||
        inline.cssText.includes("matrix") ||
        inline.cssText.includes("scale") ||
        inline.cssText.includes("rotate")
      )
        return true;
    }

    if (style.transform !== "none") {
      const t = style.transform;
      if (
        t.includes("translate") ||
        t.includes("scale") ||
        t.includes("rotate") ||
        (t.includes("matrix") && t !== "matrix(1, 0, 0, 1, 0, 0)")
      )
        return true;
    }

    if (inline.opacity && inline.opacity !== "1") return true;

    return false;
  } catch {
    return false;
  }
};

// Add element to animation list
export const addElementToAnimations = ({
  el,
  animations,
  seenSelectors,
  counterRef,
  context,
  animType = "default",
  aId,
  aTitle,
}) => {
  if (!document.contains(el)) return;

  let mainWrapper = el;
  let parent = el.parentElement;

  while (parent && parent !== document.body) {
    if (parent.hasAttribute && parent.hasAttribute("aria-label")) {
      mainWrapper = parent;
      break;
    }
    parent = parent.parentElement;
  }

  const targetEl =
    mainWrapper !== el && mainWrapper.hasAttribute("aria-label")
      ? mainWrapper
      : el;

  const selector = getFullSelector(targetEl);
  if (seenSelectors.has(selector)) return; // already added before → skip

  if (animType === "builder") {
    targetEl.classList.add("hover-outline-highlight-builder");
    targetEl.dataset.wcfAnimId = aId;
    const overlay = createBuilderOverlay(selector, aId);

    targetEl.appendChild(overlay);
  } else {
    targetEl.classList.add("hover-outline-highlight-default");
    const overlay = createDefaultOverlay(selector);

    targetEl.appendChild(overlay);
  }

  seenSelectors.add(selector);
  const result = {
    name: context ? `${context} ${counterRef.current}` : aTitle,
    selector,
    animType,
    el: targetEl,
  };

  if (aId) {
    result.aId = aId;
  }
  animations.push(result);
  counterRef.current++;
};

export const scrollToElement = (animation) => {
  if (!animation.el) return;
  const rect = animation.el.getBoundingClientRect();
  const y = rect.top + window.pageYOffset - window.innerHeight / 3;
  window.scrollTo({ top: y, behavior: "smooth" });
  animation.el.style.outline = "2px solid #55B2FF";
  setTimeout(() => (animation.el.style.outline = ""), 4000);
};

export const scrollToElementByData = (attrName, attrValue) => {
  const el = document.querySelector(`[data-${attrName}="${attrValue}"]`);
  if (!el) return;

  const container = document.querySelector(".ab-sidebar-scroll-viewport");
  if (!container) return;

  container.scrollTo({
    top: el.offsetTop - container.clientHeight / 3,
    behavior: "smooth",
  });

  el.classList.add("active-item");
  setTimeout(() => el.classList.remove("active-item"), 2000);
};

export const truncateText = (text, maxLength = 35) =>
  text.length <= maxLength ? text : text.substring(0, maxLength - 3) + "...";

// A separate function that returns your overlay DOM node
const createDefaultOverlay = (selector) => {
  const overlay = document.createElement("div");
  overlay.className = "ab-highlight-action-default";

  overlay.innerHTML = `
    <div style="display: flex; align-items: center; gap: 1px;" class="wcfanimb-skip-selector-full">

      <!-- First Icon -->
      <div style="
        display: flex;
        width: 26px;
        height: 26px;
        padding: 6px;
        justify-content: center;
        align-items: center;
        background: #21E23D;
        cursor: pointer;
        aspect-ratio: 1/1;"
        data-selector-target="${selector}"
        data-selector-tab="template"
        class="ab-setting-action"
        >
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none">
      <g clip-path="url(#clip0_11001_4982)">
        <path d="M12.4352 4.16597L12.1473 3.66629C11.9295 3.28839 11.8207 3.09944 11.6354 3.02409C11.4501 2.94875 11.2406 3.0082 10.8216 3.12711L10.1098 3.3276C9.84229 3.3893 9.56159 3.3543 9.31735 3.22879L9.12083 3.11541C8.91135 2.98125 8.75023 2.78344 8.66104 2.55093L8.46627 1.96912C8.33817 1.58411 8.27412 1.39161 8.12164 1.2815C7.96921 1.17139 7.76668 1.17139 7.36161 1.17139H6.71131C6.3063 1.17139 6.10377 1.17139 5.95128 1.2815C5.79883 1.39161 5.73479 1.58411 5.6067 1.96912L5.41189 2.55093C5.32271 2.78344 5.1616 2.98125 4.95213 3.11541L4.75562 3.22879C4.51135 3.3543 4.23068 3.3893 3.96316 3.3276L3.25136 3.12711C2.83232 3.0082 2.62281 2.94875 2.43756 3.02409C2.2523 3.09944 2.14343 3.28839 1.92567 3.66629L1.63775 4.16597C1.43364 4.5202 1.33158 4.69732 1.35139 4.88587C1.37119 5.07441 1.50782 5.22635 1.78107 5.53023L2.38251 6.20263C2.52951 6.38871 2.63387 6.71305 2.63387 7.00466C2.63387 7.29638 2.52955 7.6206 2.38253 7.80674L1.78107 8.47915C1.50782 8.78306 1.3712 8.93496 1.35139 9.12356C1.33158 9.31209 1.43364 9.48919 1.63775 9.84339L1.92567 10.3431C2.14342 10.721 2.2523 10.91 2.43756 10.9853C2.62281 11.0606 2.83233 11.0012 3.25137 10.8822L3.96313 10.6818C4.2307 10.62 4.51143 10.6551 4.75573 10.7806L4.95221 10.894C5.16163 11.0282 5.32271 11.2259 5.41188 11.4585L5.6067 12.0403C5.73479 12.4253 5.79883 12.6178 5.95128 12.728C6.10377 12.838 6.3063 12.838 6.71131 12.838H7.36161C7.76668 12.838 7.96921 12.838 8.12164 12.728C8.27412 12.6178 8.33817 12.4253 8.46627 12.0403L8.6611 11.4585C8.75024 11.2259 8.91129 11.0282 9.12077 10.894L9.31723 10.7806C9.56153 10.6551 9.84224 10.62 10.1098 10.6818L10.8216 10.8822C11.2406 11.0012 11.4501 11.0606 11.6354 10.9853C11.8207 10.91 11.9295 10.721 12.1473 10.3431L12.4352 9.84339C12.6393 9.48919 12.7413 9.31209 12.7216 9.12356C12.7017 8.93496 12.5651 8.78306 12.2919 8.47915L11.6904 7.80674C11.5434 7.6206 11.4391 7.29638 11.4391 7.00466C11.4391 6.71305 11.5435 6.38871 11.6904 6.20263L12.2919 5.53023C12.5651 5.22635 12.7017 5.07441 12.7216 4.88587C12.7413 4.69732 12.6393 4.5202 12.4352 4.16597Z" stroke="white" stroke-linecap="round"/>
        <path d="M9.05304 7.00016C9.05304 8.12775 8.13896 9.04183 7.01138 9.04183C5.88379 9.04183 4.96973 8.12775 4.96973 7.00016C4.96973 5.87258 5.88379 4.9585 7.01138 4.9585C8.13896 4.9585 9.05304 5.87258 9.05304 7.00016Z" stroke="white"/>
      </g>
      <defs>
        <clipPath id="clip0_11001_4982">
          <rect width="14" height="14" fill="white"/>
        </clipPath>
      </defs>
    </svg>
      </div>

      <!-- Second Icon -->
      <div style="
        display: flex;
        width: 26px;
        height: 26px;
        padding: 6px;
        justify-content: center;
        align-items: center;
        background: #6C6C6C;
        cursor: pointer;
        aspect-ratio: 1/1;"
        data-selector-copy="${selector}"
        class="ab-copy-action"
        >
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none">
      <g clip-path="url(#clip0_11001_4998)">
        <path d="M5.25 8.75C5.25 7.1001 5.25 6.27515 5.76256 5.76256C6.27515 5.25 7.1001 5.25 8.75 5.25H9.33333C10.9832 5.25 11.8082 5.25 12.3208 5.76256C12.8333 6.27515 12.8333 7.1001 12.8333 8.75V9.33333C12.8333 10.9832 12.8333 11.8082 12.3208 12.3208C11.8082 12.8333 10.9832 12.8333 9.33333 12.8333H8.75C7.1001 12.8333 6.27515 12.8333 5.76256 12.3208C5.25 11.8082 5.25 10.9832 5.25 9.33333V8.75Z" stroke="white" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M9.91661 5.24984C9.91521 3.52487 9.88914 2.63138 9.387 2.01959C9.29005 1.90144 9.18173 1.79311 9.0636 1.69615C8.4182 1.1665 7.45938 1.1665 5.54167 1.1665C3.62397 1.1665 2.66513 1.1665 2.01976 1.69615C1.90161 1.7931 1.79328 1.90144 1.69632 2.01959C1.16667 2.66496 1.16667 3.62381 1.16667 5.5415C1.16667 7.45921 1.16667 8.41804 1.69632 9.06344C1.79327 9.18156 1.90161 9.28989 2.01976 9.38684C2.63154 9.88897 3.52504 9.91505 5.25 9.91645" stroke="white" stroke-linecap="round" stroke-linejoin="round"/>
      </g>
      <defs>
        <clipPath id="clip0_11001_4998">
          <rect width="14" height="14" fill="white"/>
        </clipPath>
      </defs>
    </svg>
      </div>
    </div>
  `;

  return overlay;
};

const createBuilderOverlay = (selector, aId) => {
  const overlay = document.createElement("div");
  overlay.className = "ab-highlight-action-builder";

  overlay.innerHTML = `
    <div style="display: flex; align-items: center; gap: 1px;" class="wcfanimb-skip-selector-full">

      <!-- First Icon -->
      <div style="
        display: flex;
        width: 26px;
        height: 26px;
        padding: 6px;
        justify-content: center;
        align-items: center;
        background: #FF8800;
        cursor: pointer;
        aspect-ratio: 1/1;"
        data-selector-target="${selector}"
        data-selector-tab="builder"
        data-selector-aid="${aId}"
        class="ab-setting-action"
        >
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none">
      <g clip-path="url(#clip0_11001_4982)">
        <path d="M12.4352 4.16597L12.1473 3.66629C11.9295 3.28839 11.8207 3.09944 11.6354 3.02409C11.4501 2.94875 11.2406 3.0082 10.8216 3.12711L10.1098 3.3276C9.84229 3.3893 9.56159 3.3543 9.31735 3.22879L9.12083 3.11541C8.91135 2.98125 8.75023 2.78344 8.66104 2.55093L8.46627 1.96912C8.33817 1.58411 8.27412 1.39161 8.12164 1.2815C7.96921 1.17139 7.76668 1.17139 7.36161 1.17139H6.71131C6.3063 1.17139 6.10377 1.17139 5.95128 1.2815C5.79883 1.39161 5.73479 1.58411 5.6067 1.96912L5.41189 2.55093C5.32271 2.78344 5.1616 2.98125 4.95213 3.11541L4.75562 3.22879C4.51135 3.3543 4.23068 3.3893 3.96316 3.3276L3.25136 3.12711C2.83232 3.0082 2.62281 2.94875 2.43756 3.02409C2.2523 3.09944 2.14343 3.28839 1.92567 3.66629L1.63775 4.16597C1.43364 4.5202 1.33158 4.69732 1.35139 4.88587C1.37119 5.07441 1.50782 5.22635 1.78107 5.53023L2.38251 6.20263C2.52951 6.38871 2.63387 6.71305 2.63387 7.00466C2.63387 7.29638 2.52955 7.6206 2.38253 7.80674L1.78107 8.47915C1.50782 8.78306 1.3712 8.93496 1.35139 9.12356C1.33158 9.31209 1.43364 9.48919 1.63775 9.84339L1.92567 10.3431C2.14342 10.721 2.2523 10.91 2.43756 10.9853C2.62281 11.0606 2.83233 11.0012 3.25137 10.8822L3.96313 10.6818C4.2307 10.62 4.51143 10.6551 4.75573 10.7806L4.95221 10.894C5.16163 11.0282 5.32271 11.2259 5.41188 11.4585L5.6067 12.0403C5.73479 12.4253 5.79883 12.6178 5.95128 12.728C6.10377 12.838 6.3063 12.838 6.71131 12.838H7.36161C7.76668 12.838 7.96921 12.838 8.12164 12.728C8.27412 12.6178 8.33817 12.4253 8.46627 12.0403L8.6611 11.4585C8.75024 11.2259 8.91129 11.0282 9.12077 10.894L9.31723 10.7806C9.56153 10.6551 9.84224 10.62 10.1098 10.6818L10.8216 10.8822C11.2406 11.0012 11.4501 11.0606 11.6354 10.9853C11.8207 10.91 11.9295 10.721 12.1473 10.3431L12.4352 9.84339C12.6393 9.48919 12.7413 9.31209 12.7216 9.12356C12.7017 8.93496 12.5651 8.78306 12.2919 8.47915L11.6904 7.80674C11.5434 7.6206 11.4391 7.29638 11.4391 7.00466C11.4391 6.71305 11.5435 6.38871 11.6904 6.20263L12.2919 5.53023C12.5651 5.22635 12.7017 5.07441 12.7216 4.88587C12.7413 4.69732 12.6393 4.5202 12.4352 4.16597Z" stroke="white" stroke-linecap="round"/>
        <path d="M9.05304 7.00016C9.05304 8.12775 8.13896 9.04183 7.01138 9.04183C5.88379 9.04183 4.96973 8.12775 4.96973 7.00016C4.96973 5.87258 5.88379 4.9585 7.01138 4.9585C8.13896 4.9585 9.05304 5.87258 9.05304 7.00016Z" stroke="white"/>
      </g>
      <defs>
        <clipPath id="clip0_11001_4982">
          <rect width="14" height="14" fill="white"/>
        </clipPath>
      </defs>
    </svg>
      </div>

      <!-- Second Icon -->
      <div style="
        display: flex;
        width: 26px;
        height: 26px;
        padding: 6px;
        justify-content: center;
        align-items: center;
        background: #6C6C6C;
        cursor: pointer;
        aspect-ratio: 1/1;"
        data-selector-copy="${selector}"
        class="ab-copy-action"
        >
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none">
      <g clip-path="url(#clip0_11001_4998)">
        <path d="M5.25 8.75C5.25 7.1001 5.25 6.27515 5.76256 5.76256C6.27515 5.25 7.1001 5.25 8.75 5.25H9.33333C10.9832 5.25 11.8082 5.25 12.3208 5.76256C12.8333 6.27515 12.8333 7.1001 12.8333 8.75V9.33333C12.8333 10.9832 12.8333 11.8082 12.3208 12.3208C11.8082 12.8333 10.9832 12.8333 9.33333 12.8333H8.75C7.1001 12.8333 6.27515 12.8333 5.76256 12.3208C5.25 11.8082 5.25 10.9832 5.25 9.33333V8.75Z" stroke="white" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M9.91661 5.24984C9.91521 3.52487 9.88914 2.63138 9.387 2.01959C9.29005 1.90144 9.18173 1.79311 9.0636 1.69615C8.4182 1.1665 7.45938 1.1665 5.54167 1.1665C3.62397 1.1665 2.66513 1.1665 2.01976 1.69615C1.90161 1.7931 1.79328 1.90144 1.69632 2.01959C1.16667 2.66496 1.16667 3.62381 1.16667 5.5415C1.16667 7.45921 1.16667 8.41804 1.69632 9.06344C1.79327 9.18156 1.90161 9.28989 2.01976 9.38684C2.63154 9.88897 3.52504 9.91505 5.25 9.91645" stroke="white" stroke-linecap="round" stroke-linejoin="round"/>
      </g>
      <defs>
        <clipPath id="clip0_11001_4998">
          <rect width="14" height="14" fill="white"/>
        </clipPath>
      </defs>
    </svg>
      </div>
    </div>
  `;

  return overlay;
};
