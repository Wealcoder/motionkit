class ContextMenuHandler {
  menus = new Map();
  target = null;
  position = { x: 0, y: 0 };

  getProps() {
    const currentMenus = this.getContextMenus();
    return { ...this, menus: [...currentMenus] };
  }

  getContextMenus() {
    const result = [...this.menus.values()];
    return result;
  }

  register(menuData) {
    if (!menuData?.contextMenuKey || !menuData) return;
    this.menus.set(menuData?.contextMenuKey, menuData);
    return;
  }

  updateContextMenu({ target, x, y }) {
    if (!target) return;
    this.target = target;
    this.position["x"] = x;
    this.position["y"] = y;
    return;
  }
}

export default ContextMenuHandler;
