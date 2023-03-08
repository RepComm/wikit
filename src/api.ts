
import { Vec2 } from "@repcomm/vec2d";
import { EventDispatcher } from "./events.js";

export interface ToolPath {
  points: Array<Vec2>;
}

export interface ToolPathListener {
  (path: ToolPath): void;
}

export interface ToolSegment {
  a: Vec2;
  b: Vec2;
}

export interface OptionColor {
  default: string;
}
export interface OptionNumber {
  min?: number;
  max?: number;
  step?: number;
  default?: number;
}

export interface OptionTypeMap {
  color: OptionColor;
  number: OptionNumber;
}

export interface OptionConfig<K extends keyof OptionTypeMap> {
  type: K;
  params: OptionTypeMap[K];
  name?: string;
  description?: string;
  value?: any;
}

export interface OptionsConfig<K extends keyof OptionTypeMap> {
  [key: string]: OptionConfig<K>;
}

export interface ToolConfig {
  id: string;
  name: string;
  description: string;
  on_path?: ToolPathListener;
  on_segment?: ToolSegment;
  elements?: {
    button?: HTMLDivElement;
    name?: HTMLDivElement;
    optionsContainer?: HTMLDivElement;
    [key: string]: HTMLElement;
  };
  options?: OptionsConfig<keyof OptionTypeMap>;
  /**URI for toolbutton icon*/
  iconSrc?: string;
}

export interface SetActiveTool {
  tool: ToolConfig;
}

export interface APIEvents {
  register_addon: AddonJson;
  register_tool: ToolConfig;
  set_active_tool: SetActiveTool;
}

export class API {
  addonsDefs: AddonsJson;

  tools: Map<string, ToolConfig>;
  events: EventDispatcher<APIEvents>;

  constructor() {
    this.events = new EventDispatcher();
    this.tools = new Map();
  }
  register_tool<K extends keyof OptionTypeMap>(c: ToolConfig): this {
    this.tools.set(c.id, c);
    this.events.fire("register_tool", c);
    return this;
  }
  async fetchAddon(addon: AddonJson) {
    this.events.fire("register_addon", addon);
    let mod = await import(`./addons/${addon.id}/main.js`) as AddonMain;
    mod.init(this);
  }
  async fetchAddonsJson() {
    this.addonsDefs = await (await fetch("./addons/addons.json")).json() as AddonsJson;

    for (let addon of this.addonsDefs.addons) {
      await this.fetchAddon(addon);
    }
  }
  resolvePath (addonId: string): string {
    return `./addons/${addonId}/`;
  }
}

export interface AddonJson {
  id: string;
  name: string;
  description: string;
}

export interface AddonsJson {
  addons: Array<AddonJson>;
}

export interface AddonInit {
  (api: API): void;
}

export interface AddonMain {
  init: AddonInit;
}

export function rand (min: number, max?: number): number {
  if (max === undefined) {
    max = min;
    min = 0;
  }
  return min + (Math.random() * (max - min));
}
