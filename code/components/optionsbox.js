
export class OptionChangeEvent {
  constructor() {
    /**@type {any} Value that was before last change*/
    this.previousValue;
    /**@type {any} The current value*/
    this.currentValue;
    /**@type {any} The value proposed to be changed to*/
    this.proposedValue;
    /**@type {Option} Target Option*/
    this.target;
    /**@type {"post-change"|"pre-change"|"execute"}*/
    this.type;
    /**@type {Boolean}*/
    this.consumed = false;
    /**@type {Boolean} is cancelled or not*/
    this.cancelled = false;
  }
  /**@returns {OptionChangeEvent} */
  static create() {
    if (OptionChangeEvent.consumedEventPool.length > 0) {
      let optEvent = OptionChangeEvent.consumedEventPool.pop();
      optEvent.consumed = false;
      optEvent.cancelled = false;
      return optEvent;
    } else {
      return new OptionChangeEvent();
    }
  }
  /**Consume the event for recycling, should be called*/
  consume() {
    this.consumed = true;
    OptionChangeEvent.consumedEventPool.push(this);
  }

  cancel() {
    this.cancelled = true;
  }
}
/**@type {Array<OptionChangeEvent>} */
OptionChangeEvent.consumedEventPool = new Array();

class Option {
  /**Create an option (internal class, use subclasses!)
   * @param {String} name of the option, should be unique in OptionBox context
   * @param {any} value default value
   */
  constructor(name, value=0) {
    /**@type {HTMLElement}*/
    this.element;
    this.name = name;
    /**@type {any} Value of the option*/
    this.currentValue;
    this.setValue(value);
    /**@type {any} Value of the option*/
    this.previousValue;
    /**@type {HTMLSpanElement|undefined} reference, if this element has a title*/
    this.title;
    /**@type {Array<Function>}*/
    this.listeners = new Array();
  }

  makeTitle(text) {
    this.title = document.createElement("span");
    this.title.classList.add("optionsbox-option-title", "fontbody");
    this.setTitleText(text);
  }

  setTitleText(text) {
    if (this.title) {
      this.title.textContent = text;
    } else {
      throw "This option has no title, use makeTitle first!";
    }
  }

  setMin(v) {
    this.min = v;
    if (this.element) this.element.min = this.min;
    return this;
  }

  setMax(v) {
    this.max = v;
    if (this.element) this.element.max = this.max;
    return this;
  }

  setType(t) {
    if (t === "checkbox") {
      this.element.checked = this.value;
    } else if (t === "button") {
      this.element = document.createElement("button");
    }
    this.element.type = t;
    return this;
  }

  setStep(s) {
    this.step = s;
    if (this.element) this.element.step = s;
    return this;
  }

  addClass(c) {
    this.element.classList.add(c);
    return this;
  }

  /**Listen to events
   * @param {cb} cb callback
   * @callback cb
   * @param {OptionChangeEvent} evt
   */
  listen(cb) {
    if (this.listeners.includes(cb)) throw "Cannot add same listener twice!";
    this.listeners.push(cb);
  }

  removeListener(cb) {
    if (this.listeners.includes(cb)) {
      this.listeners.splice(this.listeners.indexOf(cb), 1);
    }
  }

  setResultMutate(cb) {
    this.resultMutateFunc = cb;
    if (this.resultMutateFunc && typeof (this.resultMutateFunc) === "function") {
      this.value = this.resultMutateFunc(this.value);
    }
    return this;
  }

  mount(parent) {
    if (this.title) parent.appendChild(this.title);
    parent.appendChild(this.element);
    return this;
  }

  setValue(v) {
    this.currentValue = v;
    if (this.element) this.element.value = v;
  }
}

export class OptionButton extends Option {
  constructor(name) {
    super(name);
    this.element = document.createElement("button");
    this.element.classList.add("optionsbox-option-button");
    this.element.textContent = name;

    this.element.addEventListener("click", () => {
      let optEvent = OptionChangeEvent.create();
      optEvent.type = "execute";
      optEvent.target = this;

      setTimeout(() => {
        for (let listener of this.listeners) {
          if (optEvent.consumed) break;
          listener(optEvent);
        }
      }, 0);
    });
  }
}

export class OptionNumber extends Option {
  constructor(name, value) {
    super(name, value);
    this.element = document.createElement("input");
    this.element.type = "number";
    this.element.classList.add("optionsbox-option-number");
    this.element.addEventListener("change", () => {
      let optEvent = OptionChangeEvent.create();
      optEvent.type = "pre-change";
      optEvent.target = this;
      optEvent.previousValue = undefined;
      optEvent.currentValue = this.currentValue;
      optEvent.proposedValue = parseFloat(this.element.value);

      setTimeout(() => {
        for (let listener of this.listeners) {
          if (optEvent.consumed) break;
          listener(optEvent);
        }
        if (optEvent.cancelled) {
          optEvent.consume();
        } else {
          optEvent.type = "post-change";

          optEvent.previousValue = this.currentValue;
          this.currentValue = optEvent.currentValue = this.element.value = optEvent.proposedValue;
          optEvent.proposedValue = undefined;

          for (let listener of this.listeners) {
            if (optEvent.consumed) break;
            listener(optEvent);
          }
        }
      }, 0);
    });
    this.setValue(value);
    this.makeTitle(name);
  }

  get min() {
    return this.element.min;
  }

  set min(v) {
    this.element.min = v;
  }

  get step() {
    return this.element.step;
  }

  set step(v) {
    this.element.step = v;
  }
}

export class OptionSlider extends OptionNumber {
  constructor(name, value) {
    super(name, value);
    this.element.type = "range";
    this.element.classList.remove("optionsbox-option-number");
    this.element.classList.add("optionsbox-option-slider");
  }
}

export class OptionColor extends Option {
  constructor(name, value) {
    super(name, value);
    this.element = document.createElement("input");
    this.element.type = "color";
    this.element.classList.add("optionsbox-option-color");
    this.element.addEventListener("change", () => {
      let optEvent = OptionChangeEvent.create();
      optEvent.type = "pre-change";
      optEvent.target = this;
      optEvent.previousValue = undefined;
      optEvent.currentValue = this.currentValue;
      optEvent.proposedValue = this.element.value;
      setTimeout(() => {
        for (let listener of this.listeners) {
          if (optEvent.consumed) break;
          listener(optEvent);
        }
        if (optEvent.cancelled) {
          optEvent.consume();
        } else {
          optEvent.type = "post-change";

          optEvent.previousValue = this.currentValue;
          this.currentValue = optEvent.currentValue = this.element.value = optEvent.proposedValue;
          optEvent.proposedValue = undefined;

          for (let listener of this.listeners) {
            if (optEvent.consumed) break;
            listener(optEvent);
          }
        }
      }, 0);
    });
    this.setValue(value);
    this.makeTitle(name);
  }
}

export class OptionsBox {
  constructor(name) {
    this.name = name;
    this.element = document.createElement("div");
    this.element.classList.add("optionsbox");
    /**@type {Map<String, Option>} */
    this.options = new Map();
    this.title = document.createElement("span");
    this.title.classList.add("optionsbox-title", "fontheading");
    this.title.textContent = name;
    this.element.appendChild(this.title);
  }
  mount(parent) {
    parent.appendChild(this.element);
  }
  /**Add an option to the box
   * @param {String} name Identifiable name of this option
   * @returns {Option}
   */
  add(option) {
    option.mount(this.element);
    this.options.set(name, option);
    return option;
  }
  /**Get option by its name
   * @param {String} name
   * @returns {Option}
   */
  getOption(name) {
    return this.options.get(name);
  }
}
