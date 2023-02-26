/**An event listener which handles the generic message type
 * Returning true will cancel the event for remaining listeners in order (technically sets don't have order.. whatever idc)
*/

export class EventDispatcher {
  constructor() {
    this.listeners = new Map();
  }
  on(type, listener) {
    let listeners = this.listeners.get(type);
    if (listeners === undefined) {
      listeners = new Set();
      this.listeners.set(type, listeners);
    }
    listeners.add(listener);
    return this;
  }
  off(type, listener) {
    let listeners = this.listeners.get(type);
    if (!listeners) return this;
    listeners.delete(listener);
    return this;
  }
  fire(type, msg) {
    let listeners = this.listeners.get(type);
    if (listeners === undefined) return this;
    for (let cb of listeners) {
      if (cb(msg)) return this; //return true cancels propagation
    }

    return this;
  }
}