
import Tool from "../tool.js";
import { Viewer } from "../components/viewer.js";

function touchHandler(event) {
  var touches = event.changedTouches,
    first = touches[0],
    type = "";
  switch (event.type) {
    case "touchstart": type = "mousedown"; break;
    case "touchmove": type = "mousemove"; break;
    case "touchend": type = "mouseup"; break;
    default: return;
  }

  // initMouseEvent(type, canBubble, cancelable, view, clickCount, 
  //                screenX, screenY, clientX, clientY, ctrlKey, 
  //                altKey, shiftKey, metaKey, button, relatedTarget);

  var simulatedEvent = document.createEvent("MouseEvent");
  simulatedEvent.initMouseEvent(type, true, true, window, 1,
    first.screenX, first.screenY,
    first.clientX, first.clientY, false,
    false, false, false, 0/*left*/, null);

  first.target.dispatchEvent(simulatedEvent);
  event.preventDefault();
}

class ToolBox {
  /**
   * @param {String} name displayed as toolbox name
   * @param {Viewer} viewer renderer to modify
   */
  constructor(name, viewer) {
    this.name = name;
    /**@type {Map<String, Tool>} */
    this.tools = new Map();
    this.element = document.createElement("div");
    this.element.classList.add("toolbox");
    this.currentToolName;
    this.currentTool;
    this.viewer = viewer;

    this.isNewMouseDrag = false;
    this.mouseDown = false;
    this.mouseX = 0;
    this.mouseY = 0;
    let pointerDownCallback = (evt) => {
      this.mouseDown = true;
      this.isNewMouseDrag = true;
      this.mouseX = evt.layerX;
      this.mouseY = evt.layerY;
      if (this.currentTool) {
        this.currentTool.onDraw(this.viewer.ctxActive, this.mouseX, this.mouseY, this.isNewMouseDrag);
      }
    }
    this.viewer.canvasHigher.addEventListener("pointerdown", pointerDownCallback);

    let pointerUpCallback = (evt) => {
      this.mouseDown = false;
      this.isNewMouseDrag = true;
      if (this.currentTool) {
        this.currentTool.onFinishDraw(this.viewer.ctxActive, this.mouseX, this.mouseY);
      }
    }
    this.viewer.canvasHigher.addEventListener("pointerup", pointerUpCallback);

    let pointerMoveCallback = (evt) => {
      this.mouseX = evt.clientX - this.viewer.drawRect.left;//evt.layerX;
      this.mouseY = evt.clientY - this.viewer.drawRect.top;//evt.layerY;
      if (this.currentTool) {
        if (this.currentTool.nextIsNewStroke) {
          this.isNewMouseDrag = true;
          this.currentTool.nextIsNewStroke = false;
        }
        if (this.mouseDown) {
          this.currentTool.onDraw(this.viewer.ctxActive, this.mouseX, this.mouseY, this.isNewMouseDrag);
        }
      }
      this.isNewMouseDrag = false;
    }
    window.addEventListener("pointermove", pointerMoveCallback);

    this.viewer.canvasHigher.addEventListener("touchstart", touchHandler, true);
    window.addEventListener("touchmove", touchHandler, true);
    this.viewer.canvasHigher.addEventListener("touchend", touchHandler, true);
  }

  /**Tries to add a tool to the toolbox
   * @param {Tool} tool to add
   * @returns {Tool} either added tool, or tool already in box with same name when name collision happens.
   * @throws Tool already added exception when name collision occures.
   */
  addTool(tool) {
    if (this.tools.has(tool.name)) {
      console.warn(`A tool called '${tool.name}' already added. Either name collision, or duplication. Ignoring.`);
      return this.tools.get(tool.name);
    }
    this.element.appendChild(tool.element);
    this.tools.set(tool.name, tool);
    return tool;
  }

  getTool(name) {
    return this.tools.get(name);
  }

  removeTool(name) {
    this.tools.get(name).element.remove();
    this.tools.delete(name);
  }

  setCurrentTool(name) {
    this.currentToolName = name;
    this.currentTool = this.getTool(this.currentToolName);
  }

  mount(parent) {
    parent.appendChild(this.element);
  }
}

export default ToolBox;
