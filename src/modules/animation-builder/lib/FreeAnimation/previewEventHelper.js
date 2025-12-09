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
            // removing initial props classes style.
            this.handleRemoveClassName({
              element: entry?.target,
              classList: ["wcf-free-ab-init-style-props"],
              style: entry?.target?.__wcfFreeAnimConfig?.initElementStyle,
            });

            // Adding animation classnames and styles.
            this.handleAddClassName({
              element: entry?.target,
              classList: entry?.target?.__wcfFreeAnimConfig?.classToAdd,
              style: entry?.target?.__wcfFreeAnimConfig?.styles,
            });

            // removing observation for cleanup.
            this.#onScrollObserver.unobserve(entry?.target);
            isAllCompleted++;
          } else {
            // applying initial element styles (like controlling opacity or visibility).
            if (
              entry?.target?.__wcfFreeAnimConfig?.initElementStyle &&
              Object.keys(
                entry?.target?.__wcfFreeAnimConfig?.initElementStyle ?? {}
              )?.length > 0
            ) {
              this.handleAddClassName({
                element: entry?.target,
                classList: ["wcf-free-ab-init-style-props"],
                style: entry?.target?.__wcfFreeAnimConfig?.initElementStyle,
              });
            }
          }
          // cleaning observer.
          if (isAllCompleted === this.#totalOnScrollObserver) {
            this.killOnScrollObserver();
          }
        });
      },
      {
        threshold: 0,
        rootMargin: "50% 0px -20% 0px",
      }
    );
  }

  killOnScrollObserver() {
    if (this.#onScrollObserver) {
      this.#onScrollObserver.disconnect();
      this.#onScrollObserver = null;
      this.#totalOnScrollObserver = 0;
    }
    return;
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
  handleAddClassName({ element = null, classList = [], style = {} }) {
    if (!element) return;
    // Applying inline general styles.
    if (style && typeof style === "object") {
      Object.entries(style).forEach(([key, value]) => {
        if (key !== null && element.style) {
          element.style.setProperty(`--${key}`, value);
        }
      });
    }
    // Applying mapped classname from freeAnimClassMapping.js under register into the target.
    if (Array.isArray(classList) && classList.length) {
      element.classList.add(...classList);
    }
  }

  handleRemoveClassName({ element = null, classList = [], style = {} }) {
    if (!element) return;
    // Removing inline general styles.
    if (style && typeof style === "object") {
      Object.entries(style).forEach(([key, _]) => {
        if (key !== null && element.style) {
          element.style.removeProperty(`--${key}`);
        }
      });
    }
    // Apping mapped classname from freeAnimClassMapping.js under register
    if (Array.isArray(classList) && classList.length) {
      element.classList.remove(...classList);
    }
  }
}

export default FreeAnimationEventHelperClass;
