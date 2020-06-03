
class Menu {
  /**
   * @param {String} name 
   * @param {HTMLDivElement} element 
   * @param {HTMLDivElement} subdisplay 
   */
  constructor(name, element, subdisplay) {
    this.name = name;
    this.element = element;
    this.element.ref = this;
    this.subdisplay = subdisplay;
    /**@type {Map<String, MenuItem>} */
    this.menuItems = new Map();
  }

  add(name, clicked) {
    let item = new MenuItem(name, this, clicked);
    this.menuItems.set(name, item);
    return item;
  }

  get(name) {
    return this.menuItems.get(name);
  }

  getOrCreate(name, clicked) {
    if (this.menuItems.has(name)) {
      return this.menuItems.get(name);
    } else {
      return this.add(name, clicked);
    }
  }

  displaySubMenu(parent, subitems) {
    /**@type {DOMRect} */
    let r = parent.element.getBoundingClientRect();
    this.subdisplay.style.top = r.bottom + "px";
    this.subdisplay.style.left = r.left + "px";

    while (this.subdisplay.lastChild) {
      this.subdisplay.removeChild(this.subdisplay.lastChild);
    }

    for (let item of subitems) {
      this.subdisplay.appendChild(item.element);
    }

    this.subdisplay.style.display = "block";
  }
  hideSubMenu() {
    this.subdisplay.style.display = "none";
  }
}

class SubItem {
  constructor(name, clicked) {
    this.name = name;
    this.callback = clicked;
    this.element = document.createElement("span");
    this.element.classList.add("menu-item");
    this.element.textContent = this.name;
    this.element.addEventListener("click", this.callback);
    this.element.ref = this;
  }
}

class MenuItem {
  /**
   * @param {String} name 
   * @param {Menu} menu 
   * @param {Function} clicked 
   * @param {Array<SubItem>} subitems 
   */
  constructor(name, menu, clicked, subitems = undefined) {
    this.menu = menu;
    this.name = name;
    this.callback = clicked;

    this.subitems = subitems;

    this.element = document.createElement("span");
    this.element.classList.add("menu-item");
    this.element.textContent = this.name;
    this.element.addEventListener("click", (e) => {
      this.menu.hideSubMenu();
      this.callback(e);
    });
    this.element.addEventListener("mouseenter", () => {
      if (this.subitems) {
        this.menu.displaySubMenu(this, this.subitems);
      }
    });
    this.element.addEventListener("click", () => {
      if (this.subitems) {
        this.menu.displaySubMenu(this, this.subitems);
      }
    });
    this.element.ref = this;
    menu.element.appendChild(this.element);
  }

  sub(name, clicked) {
    if (!this.subitems) this.subitems = [];
    let subitem = new SubItem(name, clicked);
    this.subitems.push(subitem);
    return this;
  }
}

export { Menu, MenuItem };
