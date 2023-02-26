

/**An event listener which handles the generic message type
 * Returning true will cancel the event for remaining listeners in order (technically sets don't have order.. whatever idc)
*/
export interface EventListener<Msg> {
  (msg: Msg): void|true;
}

export class EventDispatcher<EventMap> {
  listeners: Map<keyof EventMap, Set<EventListener<any>>>;

  constructor () {
    this.listeners = new Map();
  }

  on<K extends keyof EventMap>(type: K, listener: EventListener<EventMap[K]>): this {
    let listeners = this.listeners.get(type);
    if (listeners === undefined) {
      listeners = new Set();
      this.listeners.set(type, listeners);
    }
    listeners.add(listener);
    return this;
  }
  off<K extends keyof EventMap> (type: K, listener: EventListener<EventMap[K]>): this {
    let listeners = this.listeners.get(type);
    if (!listeners) return this;
    listeners.delete(listener);
    return this;
  }
  fire<K extends keyof EventMap>(type: K, msg: EventMap[K]): this {
    let listeners = this.listeners.get(type);
    if (listeners === undefined) return this;
    for (let cb of listeners) {
      if (cb(msg)) return this; //return true cancels propagation
    }
    return this;
  }
}

