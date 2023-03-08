import { EventDispatcher } from "./events.js";
export class API {
  constructor() {
    this.events = new EventDispatcher();
    this.tools = new Map();
  }
  register_tool(c) {
    this.tools.set(c.id, c);
    this.events.fire("register_tool", c);
    return this;
  }
  async fetchAddon(addon) {
    this.events.fire("register_addon", addon);
    let mod = await import(`./addons/${addon.id}/main.js`);
    mod.init(this);
  }
  async fetchAddonsJson() {
    this.addonsDefs = await (await fetch("./addons/addons.json")).json();
    for (let addon of this.addonsDefs.addons) {
      await this.fetchAddon(addon);
    }
  }
  resolvePath(addonId) {
    return `./addons/${addonId}/`;
  }
}
export function rand(min, max) {
  if (max === undefined) {
    max = min;
    min = 0;
  }
  return min + Math.random() * (max - min);
}