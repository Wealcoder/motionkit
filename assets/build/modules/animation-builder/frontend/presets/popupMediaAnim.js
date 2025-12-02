/******/ (function() { // webpackBootstrap
/******/ 	"use strict";
/******/ 	// The require scope
/******/ 	var __webpack_require__ = {};
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	!function() {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = function(exports, definition) {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	!function() {
/******/ 		__webpack_require__.o = function(obj, prop) { return Object.prototype.hasOwnProperty.call(obj, prop); }
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	!function() {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = function(exports) {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	}();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
/*!****************************************************************************************!*\
  !*** ./src/modules/animation-builder/frontend/animation-type/preset/popupMediaAnim.js ***!
  \****************************************************************************************/
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   popupMediaAnim: function() { return /* binding */ popupMediaAnim; }
/* harmony export */ });
// Create and append necessary styles
const style = document.createElement('style');
style.textContent = `
  body.popup-open {
    overflow: hidden;
    height: 100%;
    position: fixed;
    width: 100%;
  }
  
  .popup-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    opacity: 0;
    visibility: hidden;
    overflow-y: auto;
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px); /* For Safari */
  }
  
  .popup-content {
    background-color: transparent;
    position: relative;
    max-width: 90%;
    max-height: 90%;
    width: 50vw;
    margin: 20px auto;
  }

  /* Mobile adjustment */
  @media (max-width: 768px) {
    .popup-content {
      width: 90vw;
    }
  }
  
  .popup-close {
    position: absolute;
    top: -25px;
    right: 0px;
    width: 20px;
    height: 20px;
    cursor: pointer;
    background: none;
    border: none;
    z-index: 1001;
  }
  
  .popup-close::before, 
  .popup-close::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 0;
    width: 100%;
    height: 3px;
    background-color: #ffffff;
    transition: background-color 0.3s ease;
  }
  
  .popup-close::before {
    transform: rotate(45deg);
  }
  
  .popup-close::after {
    transform: rotate(-45deg);
  }
  
  .popup-close:hover::before, 
  .popup-close:hover::after {
    background-color: #ff0000;
  }
  
  .popup-media {
    max-width: 100%;
    max-height: 80vh;
    display: block;
    width: 100%;
  }
  
  .popup-video-container {
    position: relative;
    width: 100%;
    height: 0;
    padding-bottom: 56.25%; /* 16:9 aspect ratio */
  }
  
  .popup-video {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border: none;
    object-fit: cover;
    cursor: pointer;
  }
  
  .youtube-video {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border: none;
  }
  
  .popup-play-btn {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 80px;
    height: 80px;
    background-color: rgba(0, 0, 0, 0.7);
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
    transition: all 0.3s ease;
    z-index: 10;
    border: none;
  }
  
  .popup-play-btn:hover {
    background-color: rgba(0, 0, 0, 0.9);
    transform: translate(-50%, -50%) scale(1.1);
  }
  
  .popup-play-btn::after {
    content: '';
    border-style: solid;
    border-width: 15px 0 15px 26.0px;
    border-color: transparent transparent transparent #ffffff;
    margin-left: 5px;
  }
  
  .popup-play-btn.playing::after {
    content: '';
    width: 30px;
    height: 30px;
    background: linear-gradient(to right, #fff 30%, transparent 30%, transparent 70%, #fff 70%);
    border: none;
    margin-left: 0;
  }
  
  .popup-video-wrapper {
    position: relative;
    width: 100%;
    border-radius: 10px;
    overflow: hidden;
  }
  
  .youtube-container {
    position: relative;
    width: 100%;
    height: 0;
    padding-bottom: 56.25%;
  }
`;
document.head.appendChild(style);
function popupMediaAnim() {
  let currentSettings = {
    mediaType: '',
    mediaUrl: '',
    id: '',
    animateFrom: 'center'
  };
  const activeTimelines = new Map();
  const registeredTriggerClasses = new Set();
  const scrollTriggers = new Map();
  let scrollPosition = 0;
  function getYouTubeId(url) {
    const patterns = [/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/, /(?:youtube\.com\/embed\/)([^?]+)/, /(?:youtube\.com\/v\/)([^?]+)/, /(?:youtube\.com\/watch\?.*v=)([^&]+)/];
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    return null;
  }
  function getAnimationProperties(animateFrom) {
    const properties = {
      from: {
        scale: 0.7,
        opacity: 0
      },
      to: {
        scale: 1,
        opacity: 1,
        duration: 0.4,
        ease: 'back.out(1.7)'
      }
    };
    switch (animateFrom) {
      case 'left':
        properties.from.x = '-100%';
        properties.to.x = '0%';
        break;
      case 'right':
        properties.from.x = '100%';
        properties.to.x = '0%';
        break;
      case 'top':
        properties.from.y = '-100%';
        properties.to.y = '0%';
        break;
      case 'bottom':
        properties.from.y = '100%';
        properties.to.y = '0%';
        break;
      case 'rotate_top_left':
        properties.from.rotationZ = -180;
        properties.from.rotationX = -180;
        properties.from.transformOrigin = "0 0";
        properties.to.rotationZ = 0;
        properties.to.rotationX = 0;
        break;
      case 'rotate_top_right':
        properties.from.rotationZ = -180;
        properties.from.rotationX = -180;
        properties.from.transformOrigin = "100% 0";
        properties.to.rotationZ = 0;
        properties.to.rotationX = 0;
        break;
      case 'rotate_bottom_left':
        properties.from.rotationZ = -180;
        properties.from.rotationX = -180;
        properties.from.transformOrigin = "0 100%";
        properties.to.rotationZ = 0;
        properties.to.rotationX = 0;
        break;
      case 'rotate_bottom_right':
        properties.from.rotationZ = -180;
        properties.from.rotationX = -180;
        properties.from.transformOrigin = "100% 100%";
        properties.to.rotationZ = 0;
        properties.to.rotationX = 0;
        break;
      case 'rotate_center':
        properties.from.rotationZ = -180;
        properties.from.rotationX = -180;
        properties.to.rotationZ = 0;
        properties.to.rotationX = 0;
        break;
      default:
        break;
    }
    return properties;
  }
  const handler = e => {
    const sections = e.detail["wcf-popup-media-animation"] || [];
    const section = sections[0];
    if (!section) return;
    const {
      id,
      triggerClass,
      triggerType,
      mediaType,
      mediaUrl,
      animateFrom = 'center'
    } = section;
    if (!triggerClass || !mediaType || !mediaUrl) {
      console.warn('Popup media animation: Missing required parameters (triggerClass, mediaType, or mediaUrl)');
      return;
    }
    if (registeredTriggerClasses.has(triggerClass)) {
      return;
    }
    registeredTriggerClasses.add(triggerClass);
    const elements = document.querySelectorAll(triggerClass);
    if (elements.length === 0) {
      console.warn(`Popup media animation: No elements found with class "${triggerClass}"`);
      return;
    }
    elements.forEach(element => {
      element.removeEventListener('click', handleElementClick);
      element.removeEventListener('mouseenter', handleElementHover);
      if (scrollTriggers.has(triggerClass)) {
        scrollTriggers.get(triggerClass).kill();
        scrollTriggers.delete(triggerClass);
      }
      currentSettings = {
        mediaType,
        mediaUrl,
        id,
        animateFrom
      };
      switch (triggerType) {
        case 'hover':
          element.addEventListener('mouseenter', handleElementHover);
          break;
        case 'on_scroll':
          setupScrollTrigger(element);
          break;
        case 'page_load':
          setTimeout(openPopup, 500);
          break;
        default:
          element.addEventListener('click', handleElementClick);
      }
    });
  };
  function setupScrollTrigger(element) {
    if (element.dataset.popupTriggered) return;
    const scrollTrigger = ScrollTrigger.create({
      trigger: element,
      start: "top 80%",
      onEnter: () => {
        element.dataset.popupTriggered = true;
        openPopup();
        scrollTrigger.kill();
        scrollTriggers.delete(element.classList.contains(triggerClass) ? triggerClass : '');
      },
      once: true
    });
    scrollTriggers.set(element.classList.contains(triggerClass) ? triggerClass : '', scrollTrigger);
  }
  function handleElementClick() {
    openPopup();
  }
  function handleElementHover() {
    openPopup();
  }
  function preventScroll(e) {
    e.preventDefault();
    e.stopPropagation();
    return false;
  }
  function openPopup() {
    if (!currentSettings.mediaType || !currentSettings.mediaUrl) {
      console.warn('Popup media animation: Cannot open popup without mediaType and mediaUrl');
      return;
    }
    const popupId = currentSettings.id || `popup-${Date.now()}`;
    const existingPopup = document.querySelector('.popup-overlay');
    if (existingPopup) {
      closePopup(existingPopup);
    }
    scrollPosition = window.pageYOffset;
    document.body.classList.add('popup-open');
    document.body.style.top = `-${scrollPosition}px`;
    document.addEventListener('touchmove', preventScroll, {
      passive: false
    });
    document.addEventListener('wheel', preventScroll, {
      passive: false
    });
    const overlay = document.createElement('div');
    overlay.className = 'popup-overlay';
    overlay.dataset.popupId = popupId;
    const content = document.createElement('div');
    content.className = 'popup-content';
    const closeBtn = document.createElement('button');
    closeBtn.className = 'popup-close';
    let mediaElement;
    switch (currentSettings.mediaType) {
      case 'image':
        mediaElement = document.createElement('img');
        mediaElement.src = currentSettings.mediaUrl;
        mediaElement.alt = 'Popup Image';
        mediaElement.className = 'popup-media';
        break;
      case 'youtube':
        const youtubeContainer = document.createElement('div');
        youtubeContainer.className = 'youtube-container';
        const videoId = getYouTubeId(currentSettings.mediaUrl);
        if (!videoId) {
          console.error('Invalid YouTube URL:', currentSettings.mediaUrl);
          return;
        }
        const youtubeIframe = document.createElement('iframe');
        youtubeIframe.className = 'youtube-video';
        const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
        youtubeIframe.src = embedUrl;
        youtubeIframe.allowFullscreen = true;
        youtubeIframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
        youtubeContainer.appendChild(youtubeIframe);
        mediaElement = youtubeContainer;
        break;
      case 'video':
        const videoWrapper = document.createElement('div');
        videoWrapper.className = 'popup-video-wrapper';
        const videoContainer = document.createElement('div');
        videoContainer.className = 'popup-video-container';
        const videoEl = document.createElement('video');
        videoEl.className = 'popup-video';
        videoEl.preload = 'metadata';
        const source = document.createElement('source');
        source.src = currentSettings.mediaUrl;
        source.type = 'video/mp4';
        videoEl.appendChild(source);
        const playButton = document.createElement('button');
        playButton.className = 'popup-play-btn';
        const togglePlay = () => {
          if (videoEl.paused) {
            const playPromise = videoEl.play();
            if (playPromise !== undefined) {
              playPromise.then(() => {
                playButton.classList.add('playing');
              }).catch(error => {
                console.error('Playback failed:', error);
              });
            }
          } else {
            videoEl.pause();
            playButton.classList.remove('playing');
          }
        };
        videoEl.addEventListener('click', togglePlay);
        playButton.addEventListener('click', e => {
          e.stopPropagation();
          togglePlay();
        });
        videoEl.addEventListener('play', () => {
          playButton.classList.add('playing');
          playButton.style.display = 'none';
        });
        videoEl.addEventListener('pause', () => {
          playButton.classList.remove('playing');
          playButton.style.display = 'flex';
        });
        videoEl.addEventListener('ended', () => {
          playButton.classList.remove('playing');
          playButton.style.display = 'flex';
          videoEl.currentTime = 0;
        });
        videoContainer.appendChild(videoEl);
        videoContainer.appendChild(playButton);
        videoWrapper.appendChild(videoContainer);
        mediaElement = videoWrapper;
        break;
      default:
        console.warn(`Popup media animation: Unknown media type "${currentSettings.mediaType}"`);
        return;
    }
    content.appendChild(mediaElement);
    content.appendChild(closeBtn);
    overlay.appendChild(content);
    document.body.appendChild(overlay);
    const animationProps = getAnimationProperties(currentSettings.animateFrom);
    const timeline = gsap.timeline();
    timeline.set(overlay, {
      visibility: 'visible'
    }).to(overlay, {
      opacity: 1,
      duration: 0.3
    }).fromTo(content, animationProps.from, animationProps.to, '-=0.2');
    activeTimelines.set(popupId, {
      timeline,
      overlay
    });
    overlay.addEventListener('click', e => {
      if (e.target === overlay || e.target.classList.contains('popup-close')) {
        closePopup(overlay);
      }
    });
  }
  function closePopup(overlay) {
    const id = overlay.dataset.popupId;
    const popupData = activeTimelines.get(id);
    const video = overlay.querySelector('video');
    if (video) {
      video.pause();
    }
    const youtubeIframe = overlay.querySelector('iframe');
    if (youtubeIframe && youtubeIframe.parentNode) {
      youtubeIframe.parentNode.removeChild(youtubeIframe);
    }
    document.body.classList.remove('popup-open');
    document.body.style.top = '';
    window.scrollTo(0, scrollPosition);
    document.removeEventListener('touchmove', preventScroll);
    document.removeEventListener('wheel', preventScroll);
    if (popupData && popupData.timeline) {
      popupData.timeline.reverse().then(() => {
        if (overlay.parentNode) {
          overlay.parentNode.removeChild(overlay);
        }
        activeTimelines.delete(id);
      });
    } else {
      if (overlay.parentNode) {
        overlay.parentNode.removeChild(overlay);
      }
      activeTimelines.delete(id);
    }
  }
  function removeAnimation() {
    activeTimelines.forEach((popupData, id) => {
      if (popupData.timeline) {
        popupData.timeline.kill();
      }
      if (popupData.overlay && popupData.overlay.parentNode) {
        popupData.overlay.parentNode.removeChild(popupData.overlay);
      }
    });
    activeTimelines.clear();
    scrollTriggers.forEach((trigger, id) => {
      trigger.kill();
    });
    scrollTriggers.clear();
    document.body.classList.remove('popup-open');
    document.body.style.top = '';
    window.scrollTo(0, scrollPosition);
    document.removeEventListener('touchmove', preventScroll);
    document.removeEventListener('wheel', preventScroll);
    registeredTriggerClasses.forEach(triggerClass => {
      const triggers = document.querySelectorAll(triggerClass);
      triggers.forEach(trigger => {
        trigger.removeEventListener('click', handleElementClick);
        trigger.removeEventListener('mouseenter', handleElementHover);
        delete trigger.dataset.popupTriggered;
      });
    });
    registeredTriggerClasses.clear();
  }
  document.addEventListener("aae-animation-event", handler);
  document.addEventListener("aae-reset-animation", removeAnimation);
  return {
    destroy: removeAnimation
  };
}

// Initialize
popupMediaAnim();
/******/ })()
;
//# sourceMappingURL=popupMediaAnim.js.map