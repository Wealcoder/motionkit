import { trimString } from "@/utils/utils";

export function getOverlayInnerHTML(rect, hasAnimation, targetTag) {
  return `
    <div class="wcf-animb-overlay"
    style="
      position: sticky;
      top: ${rect.top}px;
      left: ${rect.left}px;
      width: ${rect.width}px;
      height: ${rect.height}px;
      min-width:250px;
      background: #7da76926;
      outline: 2px solid #a6c398;
    "
    >
      <div class="wcf-animb-label">
        ${hasAnimation ? "Animation Name" : `${targetTag}`}
      </div>
      <div class="wcf-animb-actions wcfanimb-skip-selector-full">
        <button data-action="wcf-ab-load-animation" class="wcf-animb-color-btn wcfanimb-skip-selector">
          <img class="wcfanimb-skip-selector" style="hight:40px;width:40px" src="${`${wcf_anim_preview_object?.base_path}/assets/images/Logo.png`}" alt="Animation Builder"/>
        </button>
        <button data-action="wcf-ab-create-animation" class="wcf-animb-code-btn wcfanimb-skip-selector">
          <svg class="wcfanimb-skip-selector" width="30" height="30" viewBox="0 0 30 30" fill="none"
            xmlns="http://www.w3.org/2000/svg">
            <path class="wcfanimb-skip-selector" d="M18.3337 21.6663C19.8738 21.6663 21.1225 20.8135 21.1225 19.7615C21.1225 17.7272 21.1452 16.889 22.9253 15.6732C23.4698 15.3012 23.4698 14.6982 22.9253 14.3262C21.1452 13.1103 21.1225 12.2722 21.1225 10.2378C21.1225 9.18579 19.8738 8.33301 18.3337 8.33301M11.667 21.6663C10.1268 21.6663 8.87821 20.8135 8.87821 19.7615C8.87821 17.7272 8.85552 16.889 7.07541 15.6732C6.53086 15.3012 6.53086 14.6982 7.07539 14.3262C8.85552 13.1103 8.87821 12.2722 8.87821 10.2378C8.87821 9.18579 10.1268 8.33301 11.667 8.33301"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  `;
}

export function getClassSelectorInnerHTML(data) {
  const {
    parentId = "N/A",
    parentUniqueSelector = "N/A",
    currentId = "N/A",
    currentUniqueSelector = "N/A",
    currentFullSelector = "N/A",
  } = data || {};
  return `
    <div class="wcf-ab-modal-overlay wcfanimb-skip-selector-full">
      <div class="wcf-ab-iframe-modal-wrapper">
        <div id="wcfanim-selectorPopup" class="wcfanimb-popup wcfanimb-skip-selector">
        <!-- selector content wrapper -->
        <div class="wcfanimb-wrapper wcfanimb-skip-selector">
          <!-- header -->
          <div id="wcf-ab-selector-header" class="wcfanimb-skip-selector">
            <!-- header left side content -->
            <div id="wcf-ab-selector-header-left" class="wcfanimb-skip-selector">
              <!-- icon -->
              <svg class="wcfanimb-skip-selector" width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle class="wcfanimb-skip-selector" cx="20" cy="20" r="20" fill="#64964C"/>
              <path class="wcfanimb-skip-selector" d="M24.4452 28.8889C26.4988 28.8889 28.1636 27.7517 28.1636 26.3491C28.1636 23.6366 28.1939 22.5191 30.5674 20.898C31.2934 20.402 31.2934 19.598 30.5674 19.102C28.1939 17.4809 28.1636 16.3633 28.1636 13.6508C28.1636 12.2481 26.4988 11.1111 24.4452 11.1111M15.5563 28.8889C13.5027 28.8889 11.8379 27.7517 11.8379 26.3491C11.8379 23.6366 11.8077 22.5191 9.4342 20.898C8.70813 20.402 8.70813 19.598 9.43418 19.102C11.8077 17.4809 11.8379 16.3633 11.8379 13.6508C11.8379 12.2481 13.5027 11.1111 15.5563 11.1111" stroke="#FAFAFA" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <div class="wcfanimb-skip-selector">
                <!-- Title -->
                <p class="wcf-ab-selector-title wcfanimb-skip-selector">
                  Class
                </p>
                <!-- Description -->
                <p class="wcf-ab-selector-description wcfanimb-skip-selector">
                  Copy your class or id
                </p>
              </div>
            </div>
            <!-- close btn -->
            ${modalCloseBtn()}
          </div>
          <div class="wcf-ab-modal-content">
          <!-- Parent class section -->
          <div class="wcf-ab-selector-content wcfanimb-skip-selector">
            <!-- Parent class selector -->
            <div class="wcf-ab-slsingle-content wcfanimb-skip-selector">
              <div class="wcf-ab-selector-content-label wcfanimb-skip-selector">
                <span class="wcfanimb-skip-selector">
                  Parent Class
                </span>
                ${copySvgBtn("wcf-ab-cpc-copy")}
              </div>
              <!-- parent class displayed section -->
              <div class="wcfanimb-classes wcfanimb-skip-selector">
                <p id="wcfanimb-parent-class-content" class="wcfanimb-popupContent wcfanimb-skip-selector">
                  ${trimString(parentUniqueSelector, 25)}
                </p>
              </div>
            </div>
            <!-- Parent id selector -->
            <div class="wcf-ab-slsingle-content wcfanimb-skip-selector">
              <div class="wcf-ab-selector-content-label wcfanimb-skip-selector">
                <span class="wcfanimb-skip-selector">
                  ID
                </span>
                ${copySvgBtn("wcf-ab-cpid-copy")}
              </div>
              <!-- parent id displayed section -->
              <div class="wcfanimb-classes wcfanimb-skip-selector">
                <p id="wcfanimb-parent-id-content" class="wcfanimb-popupContent wcfanimb-skip-selector">
                  ${trimString(parentId, 25)}
                </p>
              </div>
            </div>
          </div>
          <!-- Current class section -->
          <div class="wcf-ab-selector-content wcfanimb-skip-selector">
            <!-- Current class selector -->
            <div class="wcf-ab-slsingle-content wcfanimb-skip-selector">
              <div class="wcf-ab-selector-content-label wcfanimb-skip-selector">
                <span class="wcfanimb-skip-selector">
                  Current Class (Short)
                </span>
                ${copySvgBtn("wcf-ab-cccs-copy")}
              </div>
              <!-- current class displayed section -->
              <div class="wcfanimb-classes wcfanimb-skip-selector">
                <p id="wcfanimb-current-class-content" class="wcfanimb-popupContent wcfanimb-skip-selector">
                  ${trimString(currentUniqueSelector, 25)}
                </p>
              </div>
            </div>
            <!-- Current id selector -->
            <div class="wcf-ab-slsingle-content wcfanimb-skip-selector">
              <div class="wcf-ab-selector-content-label wcfanimb-skip-selector">
                <span class="wcfanimb-skip-selector">
                  ID
                </span>
                ${copySvgBtn("wcf-ab-ccid-copy")}
              </div>
              <!-- current class id displayed section -->
              <div class="wcfanimb-classes wcfanimb-skip-selector">
                <p id="wcfanimb-current-id-content" class="wcfanimb-popupContent wcfanimb-skip-selector">
                  ${trimString(currentId, 25)}
                </p>
              </div>
            </div>
          </div>
          <!-- Current class (long) -->
          <div class="wcf-ab-ccl-content wcfanimb-skip-selector">
            <div class="wcf-ab-selector-content-label wcfanimb-skip-selector">
              <span class="wcfanimb-skip-selector">
                Current Class(Long)
              </span>
               ${copySvgBtn("wcf-ab-cccl-copy")}
            </div>
            <!-- current class long displayed section -->
            <div class="wcfanimb-classes-long wcfanimb-skip-selector">
              <p id="wcfanimb-current-long-class-content" class="wcfanimb-popupContent wcfanimb-skip-selector">
                ${trimString(currentFullSelector, 100)}
              </p>
            </div>
          </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  `;
}

const modalCloseBtn = () => {
  return `
   <div data-action="wcfanimb-close-btn" class="wcf-ab-selector-action-general wcfanimb-close-btn wcfanimb-skip-selector">
    <svg class="wcfanimb-skip-selector" width="18" height="18" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g class="wcfanimb-skip-selector" clip-path="url(#a)" stroke="#e55f42" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <path class="wcfanimb-skip-selector" d="M14.667 8A6.667 6.667 0 1 0 1.334 8a6.667 6.667 0 0 0 13.333 0M10 10 6 6m0 4 4-4" />
      </g>
      <defs>
        <clipPath class="wcfanimb-skip-selector" id="a">
          <path class="wcfanimb-skip-selector" fill="#fff" d="M0 0h16v16H0z" />
        </clipPath>
      </defs>
      </svg>
    </div>
  `;
};

const copySvgBtn = (actionId) => {
  return `
    <button class="wcf-ab-selector-action-general" data-action=${actionId}>
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g clip-path="url(#clip0_744_10872)">
      <path d="M3.75 6.25005C3.75 5.07155 3.75 4.4823 4.11612 4.11616C4.48225 3.75005 5.0715 3.75005 6.25 3.75005H6.66667C7.84517 3.75005 8.43442 3.75005 8.80054 4.11616C9.16667 4.4823 9.16667 5.07155 9.16667 6.25005V6.66671C9.16667 7.84521 9.16667 8.43446 8.80054 8.80059C8.43442 9.16671 7.84517 9.16671 6.66667 9.16671H6.25C5.0715 9.16671 4.48225 9.16671 4.11612 8.80059C3.75 8.43446 3.75 7.84521 3.75 6.66671V6.25005Z" stroke="#E4E4E7" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"/>
      <path d="M7.08297 3.75004C7.08197 2.51792 7.06334 1.87971 6.70467 1.44272C6.63542 1.35833 6.55805 1.28095 6.47367 1.21169C6.01267 0.833374 5.3278 0.833374 3.95801 0.833374C2.58822 0.833374 1.90333 0.833374 1.44235 1.21169C1.35796 1.28094 1.28058 1.35833 1.21132 1.44272C0.833008 1.9037 0.833008 2.58859 0.833008 3.95837C0.833008 5.32816 0.833008 6.01304 1.21132 6.47404C1.28058 6.55841 1.35796 6.63579 1.44235 6.70504C1.87935 7.06371 2.51755 7.08233 3.74967 7.08333" stroke="#E4E4E7" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"/>
      </g>
      <defs>
      <clipPath id="clip0_744_10872">
      <rect width="10" height="10" fill="white"/>
      </clipPath>
      </defs>
    </svg>
  </button>
`;
};
