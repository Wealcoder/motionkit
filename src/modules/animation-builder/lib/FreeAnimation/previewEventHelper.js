class FreeAnimationEventHelperClass {
  #onScrollObserver = null;
  #totalOnScrollObserver = 0;
  #completedCount = 0;

  initOnScrollObserver() {
    if (this.#onScrollObserver) return;
    this.#onScrollObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const target = entry.target;
          const cfg = target.__wcfFreeAnimConfig;
          if (!cfg) return;

          if (entry.isIntersecting) {
            this.handleRemoveClassName({
              element: target,
              classList: ["wcf-free-ab-init-style-props"],
              style: cfg.initElementStyle,
            });
            this.handleAddClassName({
              element: target,
              classList: cfg.classToAdd,
              style: cfg.styles,
            });
            // Marker for the editor overlay to detect animated elements
            if (cfg.id) target.setAttribute("data-wcf-anim-id", cfg.id);
            this.#onScrollObserver.unobserve(target);
            // Drop back-reference so GC can reclaim the config graph
            delete target.__wcfFreeAnimConfig;
            this.#completedCount++;
          } else if (
            cfg.initElementStyle &&
            Object.keys(cfg.initElementStyle).length > 0
          ) {
            this.handleAddClassName({
              element: target,
              classList: ["wcf-free-ab-init-style-props"],
              style: cfg.initElementStyle,
            });
          }
        });

        // Tear down only after the full set of observed nodes has animated in.
        // Check outside the loop so mid-iteration unobserve calls still see a live observer.
        if (
          this.#totalOnScrollObserver > 0 &&
          this.#completedCount >= this.#totalOnScrollObserver
        ) {
          this.killOnScrollObserver();
        }
      },
      {
        threshold: 0,
        rootMargin: "50% 0px -20% 0px",
      },
    );
  }

  killOnScrollObserver() {
    if (!this.#onScrollObserver) return;
    this.#onScrollObserver.disconnect();
    this.#onScrollObserver = null;
    this.#totalOnScrollObserver = 0;
    this.#completedCount = 0;
  }

  triggerOnScrollObserver(elements = []) {
    if (!elements?.length) return;
    this.initOnScrollObserver();

    // Accumulate across calls — presets register one-by-one,
    // so totals/completions must persist between invocations.
    let added = 0;
    elements.forEach((elementConfig) => {
      const trigger = elementConfig?.trigger;
      if (typeof trigger !== "string" || !trigger) return;
      const nodes = document.querySelectorAll(trigger);
      nodes.forEach((node) => {
        node.__wcfFreeAnimConfig = elementConfig;
        this.#onScrollObserver.observe(node);
        this.#totalOnScrollObserver++;
        added++;
      });
    });

    // No new targets AND nothing in-flight — observer would sit idle forever.
    if (added === 0 && this.#totalOnScrollObserver === 0) {
      this.killOnScrollObserver();
    }
  }

  initOnPageLoadEvent(elements = []) {
    if (!elements?.length) return;
    elements.forEach((element) => {
      const { id, trigger, classToAdd, styles } = element || {};
      if (typeof trigger !== "string" || !trigger) return;
      const nodes = document.querySelectorAll(trigger);
      nodes.forEach((node) => {
        this.handleAddClassName({
          element: node,
          classList: classToAdd,
          style: styles,
        });
        // Marker for the editor overlay to detect animated elements
        if (id) node.setAttribute("data-wcf-anim-id", id);
      });
    });
  }

  handleAddClassName({ element = null, classList = [], style = {} }) {
    if (!element) return;
    if (style && typeof style === "object" && element.style) {
      Object.entries(style).forEach(([key, value]) => {
        element.style.setProperty(`--${key}`, value);
      });
    }
    if (Array.isArray(classList) && classList.length) {
      element.classList.add(...classList);
    }
  }

  handleRemoveClassName({ element = null, classList = [], style = {} }) {
    if (!element) return;
    if (style && typeof style === "object" && element.style) {
      Object.keys(style).forEach((key) => {
        element.style.removeProperty(`--${key}`);
      });
    }
    if (Array.isArray(classList) && classList.length) {
      element.classList.remove(...classList);
    }
  }
}

export default FreeAnimationEventHelperClass;
