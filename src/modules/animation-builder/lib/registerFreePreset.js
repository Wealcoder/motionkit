class RegisterFreePreset {
  #freePreset;

  constructor(initialPreset = []) {
    this.#freePreset = {};
    this.register(initialPreset);
  }

  // Helper: safely clone plain objects but keep functions/React elements intact
  #safeClone(obj) {
    if (obj === null || typeof obj !== "object") return obj;
    if (typeof obj === "function" || (obj.$$typeof && obj.props)) {
      return obj;
    }
    if (Array.isArray(obj)) {
      return obj.map((item) => this.#safeClone(item));
    }
    const cloned = {};
    for (const key in obj) {
      cloned[key] = this.#safeClone(obj[key]);
    }
    return cloned;
  }

  register(preset) {
    
    if (!preset) {
      if (WCF_ANIMATION_BUILDER.debug) {
        console.error("Preset cannot be empty");
      }
      return;
    }

    // Accept array or single preset
    const presetArray = Array.isArray(preset) ? preset : [preset];

    const validPresets = presetArray.filter(
      (item) =>
        item &&
        typeof item === "object" &&
        "presetKey" in item &&
        "groupName" in item
    );

    if (validPresets.length === 0) {
      if (WCF_ANIMATION_BUILDER.debug) {
        console.error("Invalid Free preset format");
      }
      return;
    }

    validPresets.forEach((newPreset) => {
      const group = newPreset.groupName;

      // Ensure group exists
      if (!this.#freePreset[group]) {
        this.#freePreset[group] = [];
      }

      // Check if presetKey already exists in group
      const exists = this.#freePreset[group].some(
        (item) => item.presetKey === newPreset.presetKey
      );

      if (exists) {
        if (WCF_ANIMATION_BUILDER.debug) {
          console.warn(
            `Preset with presetKey "${newPreset.presetKey}" already exists in group "${group}". Use updatePreset() to modify it.`
          );
        }
      } else {
        this.#freePreset[group].push(this.#safeClone(newPreset));
      }
    });
  }

  updatePreset(preset) {
    if (
      !preset ||
      typeof preset !== "object" ||
      !("presetKey" in preset) ||
      !("groupName" in preset)
    ) {
      if (WCF_ANIMATION_BUILDER.debug) {
        console.error("Invalid preset format for update");
      }
      return;
    }

    const group = preset.groupName;
    if (!this.#freePreset[group]) {
      if (WCF_ANIMATION_BUILDER.debug) {
        console.warn(
          `Group "${group}" does not exist. Use register() to add it.`
        );
      }
      return;
    }

    const index = this.#freePreset[group].findIndex(
      (item) => item.presetKey === preset.presetKey
    );
    if (index === -1) {
      if (WCF_ANIMATION_BUILDER.debug) {
        console.warn(
          `Preset "${preset.presetKey}" does not exist in group "${group}". Use register() to add it.`
        );
      }
      return;
    }

    this.#freePreset[group][index] = {
      ...this.#freePreset[group][index],
      ...this.#safeClone(preset),
    };
  }

  getSingleFreePresets(groupName, presetKey) {
    if (!this.#freePreset[groupName]) return null;
    const found = this.#freePreset[groupName].find(
      (item) => item.presetKey === presetKey
    );
    return found ? this.#safeClone(found) : null;
  }

  getAllFreePresets(groupName = null) {
    if (groupName) {
      return this.#freePreset[groupName]
        ? this.#freePreset[groupName].map((item) => this.#safeClone(item))
        : [];
    }
    // Return all groups
    const allGroups = {};
    for (const group in this.#freePreset) {
      allGroups[group] = this.#freePreset[group].map((item) =>
        this.#safeClone(item)
      );
    }
    return allGroups;
  }

  hasPreset(groupName, presetKey) {
    return (
      this.#freePreset[groupName]?.some(
        (item) => item.presetKey === presetKey
      ) || false
    );
  }

  removePreset(groupName, presetKey) {
    if (!this.#freePreset[groupName]) return;
    this.#freePreset[groupName] = this.#freePreset[groupName].filter(
      (item) => item.presetKey !== presetKey
    );
    if (WCF_ANIMATION_BUILDER.debug) {
      console.log(
        `Preset "${presetKey}" removed from group "${groupName}" (if it existed).`
      );
    }
  }

  getAllFreePresetGroups() {
    return Object.keys(this.#freePreset);
  }

  findGroupByPresetKey(presetKey) {
    for (const group in this.#freePreset) {
      if (
        this.#freePreset[group].some((item) => item.presetKey === presetKey)
      ) {
        return group;
      }
    }
    return null; // Not found
  }
}

export default RegisterFreePreset;
