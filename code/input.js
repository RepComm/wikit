
import { on, off } from "./aliases.js";

export class Input {
  constructor () {
    this.pointer = {
      x:0,
      y:0,
      leftDown:false,
      rightDown:false
    };
    /**@type {Map<string,boolean>} keyname:state*/
    this.keyboard = new Map();
    /**@param {MouseEvent} evt*/
    this.onMouseMove = (evt)=>{
      this.pointer.x = evt.clientX;
      this.pointer.y = evt.clientY;
      this.onEvent("pointer-move");
    };
    /**@param {TouchEvent} evt*/
    this.onTouchMove = (evt)=>{
      let item = evt.changedTouches.item(0);
      this.pointer.x = item.clientX;
      this.pointer.y = item.clientY;
      this.onEvent("pointer-move");
    };

    /**@param {MouseEvent} evt*/
    this.onMouseDown = (evt)=>{
      this.pointer.x = evt.clientX;
      this.pointer.y = evt.clientY;
      if (evt.button === 0) {
        this.pointer.leftDown = true;
      } else if (evt.button === 1) {
        this.pointer.rightDown = true;
      }
      this.onEvent("pointer-down");
    }
    /**@param {TouchEvent} evt*/
    this.onTouchStart = (evt)=>{
      this.pointer.leftDown = true;
      let item = evt.changedTouches.item(0);
      this.pointer.x = item.clientX;
      this.pointer.y = item.clientY;
      this.onEvent("pointer-down");
    }
    /**@param {MouseEvent} evt*/
    this.onMouseUp = (evt)=>{
      this.pointer.x = evt.clientX;
      this.pointer.y = evt.clientY;
      if (evt.button === 0) {
        this.pointer.leftDown = false;
      } else if (evt.button === 1) {
        this.pointer.rightDown = false;
      }
      this.onEvent("pointer-up");
    }
    /**@param {TouchEvent} evt*/
    this.onTouchEnd = (evt)=>{
      this.pointer.leftDown = false;
      let item = evt.changedTouches.item(0);
      this.pointer.x = item.clientX;
      this.pointer.y = item.clientY;
      this.onEvent("pointer-up");
    }
    /**@param {KeyboardEvent} evt*/
    this.onKeyDown = (evt)=>{
      this.keyboard.set(evt.key, true);
      this.onEvent("key-down");
    }
    /**@param {KeyboardEvent} evt*/
    this.onKeyUp = (evt)=>{
      this.keyboard.set(evt.key, false);
      this.onEvent("key-up");
    }
    /**@callback eventCallback
     * @param {"key-up"|"key-down"|"pointer-up"|"pointer-down"} type
     * @type {Array<eventCallback>} */
    this.listeners = new Array();
  }
  /**Listen to events
   * @param {eventCallback} cb
   * @callback eventCallback
   * @param {"key-up"|"key-down"|"pointer-up"|"pointer-down"} type
   */
  listen (cb) {
    this.listeners.push(cb);
  }
  /**Remove a listener
   * @param {eventCallback} cb
   * @returns {boolean} false if callback wasn't contained in the listeners
   */
  deafen (cb) {
    let ind = this.listeners.indexOf(cb);
    if (ind === -1) return false;
    this.listeners.splice(ind, 1);
    return true;
  }
  unregisterEvents () {
    off(window, "mousemove", this.onMouseMove);
    off(window, "touchmove", this.onTouchMove);

    off(window, "mousedown", this.onMouseDown);
    off(window, "touchstart", this.onTouchStart);

    off(window, "mouseup", this.onMouseUp);
    off(window, "touchend", this.onTouchEnd);
  }
  registerEvents () {
    on(window, "mousemove", this.onMouseMove);
    on(window, "touchmove", this.onTouchMove);

    on(window, "mousedown", this.onMouseDown);
    on(window, "touchstart", this.onTouchStart);

    on(window, "mouseup", this.onMouseUp);
    on(window, "touchend", this.onTouchEnd);
  }
  /**@param {"key-up"|"key-down"|"pointer-up"|"pointer-down"} type*/
  onEvent (type) {
    for (let l of this.listeners) {
      l(type);
    }
  }
}
