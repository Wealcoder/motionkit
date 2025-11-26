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

export function popupMediaAnim() {
  // Global variables to store animation settings
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

  // Function to extract YouTube video ID from various URL formats
  function getYouTubeId(url) {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/,
      /(?:youtube\.com\/embed\/)([^?]+)/,
      /(?:youtube\.com\/v\/)([^?]+)/,
      /(?:youtube\.com\/watch\?.*v=)([^&]+)/
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }

    return null;
  }

  // Get animation properties based on animateFrom value
  function getAnimationProperties(animateFrom) {
    const properties = {
      from: { scale: 0.7, opacity: 0 },
      to: { scale: 1, opacity: 1, duration: 0.4, ease: 'back.out(1.7)' }
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
      default: // center
        // No additional properties needed for center
        break;
    }

    return properties;
  }

  // Main event handler
  const handler = (e) => {
    const sections = e.detail["wcf-popup-media-animation"] || [];

    // Process only the first section to avoid loops
    const section = sections[0];
    if (!section) return;

    const {
      id,
      triggerClass,
      triggerType,
      mediaType,
      mediaUrl,
      animateFrom = 'center' // Default to center
    } = section;

    // Don't proceed if required parameters are missing
    if (!triggerClass || !mediaType || !mediaUrl) {
      console.warn('Popup media animation: Missing required parameters (triggerClass, mediaType, or mediaUrl)');
      return;
    }

    // Skip if this trigger class is already registered
    if (registeredTriggerClasses.has(triggerClass)) {
      return;
    }

    // Store the trigger class for cleanup
    registeredTriggerClasses.add(triggerClass);

    // Set up event listeners based on trigger type
    const elements = document.querySelectorAll(triggerClass);

    if (elements.length === 0) {
      console.warn(`Popup media animation: No elements found with class "${triggerClass}"`);
      return;
    }

    elements.forEach(element => {
      // Remove any existing event listeners to prevent duplicates
      element.removeEventListener('click', handleElementClick);
      element.removeEventListener('mouseenter', handleElementHover);

      // Remove any existing scroll trigger
      if (scrollTriggers.has(triggerClass)) {
        scrollTriggers.get(triggerClass).kill();
        scrollTriggers.delete(triggerClass);
      }

      // Store settings in global variable
      currentSettings = {
        mediaType,
        mediaUrl,
        id,
        animateFrom
      };

      // Add event listener based on trigger type
      switch (triggerType) {
        case 'hover':
          element.addEventListener('mouseenter', handleElementHover);
          break;
        case 'on_scroll':
          setupScrollTrigger(element);
          break;
        case 'page_load':
          // Open popup immediately on page load
          setTimeout(openPopup, 500); // Small delay to ensure page is fully loaded
          break;
        default:
          // Default to click for any other trigger type
          element.addEventListener('click', handleElementClick);
      }
    });
  };

  // Setup scroll trigger using GSAP ScrollTrigger
  function setupScrollTrigger(element) {
    // Create a marker to track if this element has already triggered
    if (element.dataset.popupTriggered) return;

    const scrollTrigger = ScrollTrigger.create({
      trigger: element,
      start: "top 80%", // When the top of the element hits 80% down from the top of the viewport
      onEnter: () => {
        // Mark as triggered to prevent multiple triggers
        element.dataset.popupTriggered = true;
        openPopup();

        // Optional: kill the trigger after it's been activated
        scrollTrigger.kill();
        scrollTriggers.delete(element.classList.contains(triggerClass) ? triggerClass : '');
      },
      once: true // Only trigger once
    });

    // Store the scroll trigger for cleanup
    scrollTriggers.set(element.classList.contains(triggerClass) ? triggerClass : '', scrollTrigger);
  }

  // Handle element click
  function handleElementClick() {
    openPopup();
  }

  // Handle element hover
  function handleElementHover() {
    openPopup();
  }

  // Prevent scroll on background
  function preventScroll(e) {
    e.preventDefault();
    e.stopPropagation();
    return false;
  }

  // Open popup function
  function openPopup() {
    // Don't proceed if mediaType or mediaUrl is missing
    if (!currentSettings.mediaType || !currentSettings.mediaUrl) {
      console.warn('Popup media animation: Cannot open popup without mediaType and mediaUrl');
      return;
    }

    // Generate ID if not provided
    const popupId = currentSettings.id || `popup-${Date.now()}`;

    // Close any existing popup
    const existingPopup = document.querySelector('.popup-overlay');
    if (existingPopup) {
      closePopup(existingPopup);
    }

    // Prevent background scrolling
    scrollPosition = window.pageYOffset;
    document.body.classList.add('popup-open');
    document.body.style.top = `-${scrollPosition}px`;

    // Add touchmove event listener to prevent scrolling
    document.addEventListener('touchmove', preventScroll, { passive: false });
    document.addEventListener('wheel', preventScroll, { passive: false });

    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'popup-overlay';
    overlay.dataset.popupId = popupId;

    // Create content container
    const content = document.createElement('div');
    content.className = 'popup-content';

    // Create close button
    const closeBtn = document.createElement('button');
    closeBtn.className = 'popup-close';

    // Create media based on type
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

        // Extract YouTube video ID from URL
        const videoId = getYouTubeId(currentSettings.mediaUrl);

        if (!videoId) {
          console.error('Invalid YouTube URL:', currentSettings.mediaUrl);
          return;
        }

        // Create YouTube iframe with proper parameters for autoplay
        const youtubeIframe = document.createElement('iframe');
        youtubeIframe.className = 'youtube-video';

        // Build embed URL with autoplay
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

        // Add play button overlay for local videos
        const playButton = document.createElement('button');
        playButton.className = 'popup-play-btn';

        // Play/Pause functionality
        const togglePlay = () => {
          if (videoEl.paused) {
            const playPromise = videoEl.play();
            if (playPromise !== undefined) {
              playPromise
                .then(() => {
                  playButton.classList.add('playing');
                })
                .catch(error => {
                  console.error('Playback failed:', error);
                });
            }
          } else {
            videoEl.pause();
            playButton.classList.remove('playing');
          }
        };

        // Click video to play/pause
        videoEl.addEventListener('click', togglePlay);

        // Click play button to play/pause
        playButton.addEventListener('click', (e) => {
          e.stopPropagation(); // Prevent triggering video click event
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

    // Assemble the popup
    content.appendChild(mediaElement);
    content.appendChild(closeBtn);
    overlay.appendChild(content);

    // Add to DOM
    document.body.appendChild(overlay);

    // Get animation properties based on animateFrom value
    const animationProps = getAnimationProperties(currentSettings.animateFrom);

    // Create GSAP timeline for animation
    const timeline = gsap.timeline();
    timeline
      .set(overlay, { visibility: 'visible' })
      .to(overlay, { opacity: 1, duration: 0.3 })
      .fromTo(content, animationProps.from, animationProps.to, '-=0.2');

    // Store timeline reference with ID as key
    activeTimelines.set(popupId, { timeline, overlay });

    // Add event listeners for closing
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay || e.target.classList.contains('popup-close')) {
        closePopup(overlay);
      }
    });
  }

  // Close popup function
  function closePopup(overlay) {
    const id = overlay.dataset.popupId;
    const popupData = activeTimelines.get(id);

    // Pause any video that's playing
    const video = overlay.querySelector('video');
    if (video) {
      video.pause();
    }

    // Remove YouTube iframe to stop playback
    const youtubeIframe = overlay.querySelector('iframe');
    if (youtubeIframe && youtubeIframe.parentNode) {
      youtubeIframe.parentNode.removeChild(youtubeIframe);
    }

    // Allow background scrolling again
    document.body.classList.remove('popup-open');
    document.body.style.top = '';
    window.scrollTo(0, scrollPosition);

    // Remove event listeners that prevent scrolling
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

  // Cleanup function
  function removeAnimation() {
    // Kill all timelines
    activeTimelines.forEach((popupData, id) => {
      if (popupData.timeline) {
        popupData.timeline.kill();
      }
      if (popupData.overlay && popupData.overlay.parentNode) {
        popupData.overlay.parentNode.removeChild(popupData.overlay);
      }
    });

    // Clear the map
    activeTimelines.clear();

    // Kill all scroll triggers
    scrollTriggers.forEach((trigger, id) => {
      trigger.kill();
    });
    scrollTriggers.clear();

    // Allow background scrolling
    document.body.classList.remove('popup-open');
    document.body.style.top = '';
    window.scrollTo(0, scrollPosition);

    // Remove event listeners that prevent scrolling
    document.removeEventListener('touchmove', preventScroll);
    document.removeEventListener('wheel', preventScroll);

    // Remove all event listeners from trigger elements using registered classes
    registeredTriggerClasses.forEach(triggerClass => {
      const triggers = document.querySelectorAll(triggerClass);
      triggers.forEach(trigger => {
        trigger.removeEventListener('click', handleElementClick);
        trigger.removeEventListener('mouseenter', handleElementHover);
        delete trigger.dataset.popupTriggered;
      });
    });

    // Clear registered classes
    registeredTriggerClasses.clear();
  }

  // Event listeners
  document.addEventListener("aae-animation-event", handler);
  document.addEventListener("aae-reset-animation", removeAnimation);

  return { destroy: removeAnimation };
}

// Initialize
popupMediaAnim();