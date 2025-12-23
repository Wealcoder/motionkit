class ContextMenuHandler {
  menuItems = new Map();

  getContextMenus() {
    const result = [...this.menuItems.values()];
    return result;
  }

  register(menuData) {
    if (!menuData?.contextMenuKey || !menuData) return;
    this.menuItems.set(menuData?.contextMenuKey, menuData);
  }
}

export default ContextMenuHandler;
