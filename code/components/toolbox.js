
import { Tool, API } from "../api.js";
import { Component } from "./component.js";
import { make } from "../utils/aliases.js";

class ToolBox extends Component {
  /**@param {String} name displayed as toolbox name*/
  constructor(name) {
    super();
    this.name = name;
    /**@type {Array<Tool>} */
    this.tools = new Map();

    this.make("div");
    this.addClasses("toolbox");

    this.endSpace = new Component()
      .make("div")
      .mountChild(make("br"))
      .mountChild(make("br"))
      .mountChild(make("br"));

    this.activeTool;

    API.Global.input.listen((type)=>this.onEvent(type));
  }
  
  onEvent(type) {
    if (this.activeTool) {
      if (type === "pointer-move") {
        if (API.Global.viewer.pointObjInside(
          API.Global.input.pointer
        )) {
          this.activeTool.onEvent(type);
        }
      } else {
        this.activeTool.onEvent(type);
      }
    }
  }

  /**@param {Tool} tool */
  setActiveTool(tool) {
    this.activeTool = tool;
    API.Global.config.removeChildren();
    tool.options.mount(API.Global.config);
    this.endSpace.mount(tool.options);
  }
}

export default ToolBox;
