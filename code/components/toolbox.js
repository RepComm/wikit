
import { Tool, API } from "../api.js";
import { Component } from "./component.js";

class ToolBox extends Component {
  /**@param {String} name displayed as toolbox name
   * @param {API} api to call
   */
  constructor(name, api) {
    super();
    this.name = name;
    /**@type {Map<String, Tool>} */
    this.tools = new Map();

    this.make("div");
    this.addClasses("toolbox");

    this.activeTool;

    api.input.listen(this.onEvent);

    //this.viewer.canvasHigher.addEventListener("pointerdown", pointerDownCallback);
    //this.viewer.canvasHigher.addEventListener("pointerup", pointerUpCallback);
  }
  
  onEvent(evt) {
    
  }

  /**@param {Tool} tool */
  setActiveTool(tool) {
    this.activeTool = tool;
  }
}

export default ToolBox;
