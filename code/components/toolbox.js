
import { Tool, API } from "../api.js";
import { Component } from "./component.js";

class ToolBox extends Component {
  /**@param {String} name displayed as toolbox name*/
  constructor(name) {
    super();
    this.name = name;
    /**@type {Array<Tool>} */
    this.tools = new Map();

    this.make("div");
    this.addClasses("toolbox");

    this.activeTool;

    API.Global.input.listen((type)=>this.onEvent(type));
  }
  
  onEvent(type) {
    if (this.activeTool) {
      this.activeTool.onEvent(type);
    }
  }

  /**@param {Tool} tool */
  setActiveTool(tool) {
    this.activeTool = tool;
    API.Global.config.removeChildren();
    
    tool.options.mount(API.Global.config);
  }
}

export default ToolBox;
