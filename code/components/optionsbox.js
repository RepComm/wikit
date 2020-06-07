
import { Component } from "../components/component.js";

export class Option extends Component {
  /**@param {string} id a string meant to be unique in the optionsbox
   * @param {string} name a display name for the option
  */
  constructor(id, name) {
    super();
    this.make("div");
    this.addClasses("optionsbox-option");
    this.id(id);

    /**@type {Component} Title of the option*/
    this.title = new Component()
      .make("span")
      .id(`${id}-title`)
      .addClasses("optionsbox-option-title")
      .textContent(name)
      .mount(this);
  }

  getId () {
    return this.element.id;
  }
}

export class OptionButton extends Option {
  constructor(id, name, text = undefined) {
    super(id, name);
    this.button = new Component()
      .make("button")
      .addClasses("optionsbox-option-button")
      .textContent(text || name)
      .mount(this);
  }
}

export class OptionNumber extends Option {
  /**@param {string} name*/
  constructor(id, name) {
    super(id, name);
    this.input = new Component()
      .make("input")
      .type("number")
      .addClasses("optionsbox-option-number")
      .mount(this);

    this.title.textContent(name);
  }
  /**@returns {number}*/
  get min() {
    return this.element.min;
  }
  /**@param {number} v*/
  set min(v) {
    this.element.min = v;
  }
  /**@returns {number}*/
  get step() {
    return this.element.step;
  }
  /**@param {number} v*/
  set step(v) {
    this.element.step = v;
  }
  /**@returns {number}*/
  get value() {
    return parseFloat(this.element.value);
  }
  /**@param {number} v*/
  set value(v) {
    this.element.value = v.toString();
  }
}

export class OptionSlider extends OptionNumber {
  constructor(id, name) {
    super(id, name);
    this.input.type("range");
    this.addClasses("optionsbox-option-slider");
    this.removeClasses("optionsbox-option-number");
  }
}

export class OptionColor extends Option {
  constructor(name) {
    super(name);
    this.input = new Component()
      .make("input")
      .type("color")
      .addClasses("optionsbox-option-color")
      .mount(this);
  }
  get color () {
    return this.input.value;
  }
  set color (v) {
    this.input.value = v;
  }
  setRGB (r, g, b) {
    this.input.value = `rgb(${r},${g},${b})`;
  }
}

export class OptionsBox extends Component {
  constructor(name) {
    super();
    this.make("div");
    this.addClasses("optionsbox");
    
    /**@type {Map<string, Option>} */
    this.options = new Map();

    this.title = new Component()
      .make("span")
      .addClasses("optionsbox-title")
      .textContent(name)
      .mount(this);
  }
  /**Add an option to the box
   * @param {Option} option
   * @returns {OptionsBox} self
   */
  add(option) {
    this.options.set(option.getId(), option);
    option.mount(this);
    return this;
  }
  /**Get option by its id
   * @param {string} id
   * @returns {Option}
   */
  getOptionById(id) {
    return this.options.get(id);
  }
}
