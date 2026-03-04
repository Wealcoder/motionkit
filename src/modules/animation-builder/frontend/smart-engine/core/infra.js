export class Hooks {
  constructor() {
    this.actions = {};
    this.filters = {};
  }

  addAction(name, fn, priority = 10) {
    (this.actions[name] ||= []).push({ fn, priority });
    this.actions[name].sort((a, b) => a.priority - b.priority);
  }

  removeAction(name, fn, priority = 10) {
    if (!this.actions[name]) return;
    this.actions[name] = this.actions[name].filter(
      h => !(h.fn === fn && h.priority === priority)
    );
  }

  doAction(name, ...args) {
    (this.actions[name] || []).forEach(h => h.fn(...args));
  }

  addFilter(name, fn, priority = 10) {
    (this.filters[name] ||= []).push({ fn, priority });
    this.filters[name].sort((a, b) => a.priority - b.priority);
  }

  removeFilter(name, fn, priority = 10) {
    if (!this.filters[name]) return;
    this.filters[name] = this.filters[name].filter(
      h => !(h.fn === fn && h.priority === priority)
    );
  }

  applyFilters(name, value, ...args) {
    return (this.filters[name] || []).reduce((v, h) => h.fn(v, ...args), value);
  }

  clearAllForName(name) {
    delete this.actions[name];
    delete this.filters[name];
  }
}

export class Registry {
  constructor(name) {
    this.name = name;
    this.map = new Map();
  }

  register(id, item) {
    if (this.map.has(id)) {
      console.warn(`[Registry:${this.name}] Overwriting ${id}`);
    }
    this.map.set(id, item);
  }

  get(id) { return this.map.get(id); }
  has(id) { return this.map.has(id); }
  getAll() { return Array.from(this.map.values()); }
  getAllIds() { return Array.from(this.map.keys()); }

  remove(id) {
    const item = this.map.get(id);
    if (item) {
      if (typeof item.kill === 'function') item.kill();
      else if (typeof item.destroy === 'function') item.destroy();
      this.map.delete(id);
      return true;
    }
    return false;
  }

  killAll() {
    for (const item of this.map.values()) {
      if (typeof item.kill === 'function') item.kill();
      if (typeof item.destroy === 'function') item.destroy();
    }
    this.map.clear();
  }
}
