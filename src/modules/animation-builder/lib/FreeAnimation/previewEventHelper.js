class FreeAnimationEventHelperClass {
  #onScrollObserver = null;
  #totalOnScrollObserver = 0;

  // Events Functions
  initOnScrollObserver() {
    if (this.#onScrollObserver) return;
    this.#onScrollObserver = new IntersectionObserver(
      (entries) => {
        let isAllCompleted = 0; // using for clean up purpose
        entries?.forEach((entry) => {
          if (entry?.isIntersecting) {
            // if intersecting adding classnames and styles.
            this.handleAddClassName({
              elements: entry?.target,
              classList: entry?.target?.__wcfFreeAnimConfig?.classToAdd,
              style: entry?.target?.__wcfFreeAnimConfig?.styles,
            });
            // removing observation when intersected.
            this.#onScrollObserver.unobserve(entry?.target);
            isAllCompleted++;
            if (WCF_ANIMATION_BUILDER.debug) {
              console.log(``);
            }
          } else {
            // applying initial element styles (like controlling opacity or visibility)
            if (
              entry?.target?.__wcfFreeAnimConfig?.initElementStyle &&
              Object.keys(
                entry?.target?.__wcfFreeAnimConfig?.initElementStyle ?? {}
              )?.length > 0
            ) {
              this.handleAddClassName({
                elements: entry,
                style: entry?.target?.__wcfFreeAnimConfig?.initElementStyle,
              });
            }
          }
          // cleaning observer.
          if (isAllCompleted === this.#totalOnScrollObserver) {
            this.#onScrollObserver.disconnect();
          }
        });
      },
      {
        threshold: 0,
        rootMargin: "50% 0px -50% 0px",
      }
    );
  }

  triggerOnScrollObserver(elements = []) {
    if (!elements?.length) return;
    if (!this.#onScrollObserver) this.initOnScrollObserver();
    this.#totalOnScrollObserver = elements?.length;
    elements.forEach((elementConfig) => {
      if (elementConfig?.trigger) {
        // getting all node by trigger.
        const nodes = document.querySelectorAll(elementConfig?.trigger);
        nodes.forEach((node) => {
          node.__wcfFreeAnimConfig = elementConfig; // assigning animation value.
          this.#onScrollObserver.observe(node); // observing
        });
      }
    });
  }

  // Helper Functions
  handleAddClassName({ elements = null, classList = [], style = {} }) {
    if (!elements) return;
    // Applying inline general styles.
    if (style && typeof style === "object") {
      Object.entries(style).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          elements.style[key] = value;
        }
      });
    }
    // Apping mapped classname from freeAnimClassMapping.js under register
    if (Array.isArray(classList) && classList.length) {
      elements.classList.add(...classList);
    }
  }
}

export default FreeAnimationEventHelperClass;
