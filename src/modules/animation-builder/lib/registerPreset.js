class RegisterPreset {
  #preset;

  constructor(initialPreset = []) {
    this.#preset = {};
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
      if (WCF_ADDONS_ANIMATION_BUILDER.debug) {
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
      if (WCF_ADDONS_ANIMATION_BUILDER.debug) {
        console.error("Invalid preset format");
      }
      return;
    }

    validPresets.forEach((newPreset) => {
      const group = newPreset.groupName;

      // Ensure group exists
      if (!this.#preset[group]) {
        this.#preset[group] = [];
      }

      // Check if presetKey already exists in group
      const exists = this.#preset[group].some(
        (item) => item.presetKey === newPreset.presetKey
      );

      if (exists) {
        if (WCF_ADDONS_ANIMATION_BUILDER.debug) {
          console.warn(
            `Preset with presetKey "${newPreset.presetKey}" already exists in group "${group}". Use updatePreset() to modify it.`
          );
        }
      } else {
        this.#preset[group].push(this.#safeClone(newPreset));
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
      if (WCF_ADDONS_ANIMATION_BUILDER.debug) {
        console.error("Invalid preset format for update");
      }
      return;
    }

    const group = preset.groupName;
    if (!this.#preset[group]) {
      if (WCF_ADDONS_ANIMATION_BUILDER.debug) {
        console.warn(
          `Group "${group}" does not exist. Use register() to add it.`
        );
      }
      return;
    }

    const index = this.#preset[group].findIndex(
      (item) => item.presetKey === preset.presetKey
    );
    if (index === -1) {
      if (WCF_ADDONS_ANIMATION_BUILDER.debug) {
        console.warn(
          `Preset "${preset.presetKey}" does not exist in group "${group}". Use register() to add it.`
        );
      }
      return;
    }

    this.#preset[group][index] = {
      ...this.#preset[group][index],
      ...this.#safeClone(preset),
    };
  }

  getPreset(groupName, presetKey) {
    if (!this.#preset[groupName]) return null;
    const found = this.#preset[groupName].find(
      (item) => item.presetKey === presetKey
    );
    return found ? this.#safeClone(found) : null;
  }

  getAllPresets(groupName = null) {
    if (groupName) {
      return this.#preset[groupName]
        ? this.#preset[groupName].map((item) => this.#safeClone(item))
        : [];
    }
    // Return all groups
    const allGroups = {};
    for (const group in this.#preset) {
      allGroups[group] = this.#preset[group].map((item) =>
        this.#safeClone(item)
      );
    }
    return allGroups;
  }

  hasPreset(groupName, presetKey) {
    return (
      this.#preset[groupName]?.some((item) => item.presetKey === presetKey) ||
      false
    );
  }

  removePreset(groupName, presetKey) {
    if (!this.#preset[groupName]) return;
    this.#preset[groupName] = this.#preset[groupName].filter(
      (item) => item.presetKey !== presetKey
    );
    if (WCF_ADDONS_ANIMATION_BUILDER.debug) {
      console.log(
        `Preset "${presetKey}" removed from group "${groupName}" (if it existed).`
      );
    }
  }

  getAllGroups() {
    return Object.keys(this.#preset);
  }

  findGroupByPresetKey(presetKey) {
    for (const group in this.#preset) {
      if (this.#preset[group].some(item => item.presetKey === presetKey)) {
        return group;
      }
    }
    return null; // Not found
  }
}

export default RegisterPreset;
