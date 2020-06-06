
import { Component } from "./component.js";

class Choice extends Component {
  constructor () {
    super();
    this.make("span");
    this.addClasses("choicebox-option");
    /**@type {ChoiceBox} Parent choice box*/
    this.choicebox = undefined;
  }
  /**Sets the title
   * @param {string} txt
   * @returns {Choice} self
   */
  title (txt) {
    this.element.textContent = txt;
    return this;
  }
  /**Sets the tooltip content
   * @param {string} txt
   * @returns {Choice} self
   */
  tooltip (txt) {
    this._tooltip = txt;
    return this;
  }
}

class ChoiceBox extends Component {
  constructor() {
    super();
    /**@type {Array<Choice>} */
    this.choices = new Array();

    this.make("div");
    this.addClasses("choicebox");
    
    this.tooltip = new Component()
      .make("span")
      .addClasses("choicebox-tooltip");

    this.hide();
    this.tooltip.mount(document.body);

    this.listener = (resolve, reject, evt)=>{
      if (evt.target.classList.contains("choicebox-option")) {
        if (evt.target.id.toLowerCase() === "cancel") {
          reject("cancel");
        } else {
          resolve(evt.target.id);
        }
        this.hide();
      }
    }
  }
  /**Internal; called when a tooltip should be shown
   * @param {Choice} choice 
   */
  onTooltip (choice) {
    this.tooltip.show();
    this.tooltip.textContent(choice._tooltip);
    this.tooltip.left = choice.rect.left + "px";
    this.tooltip.top = choice.rect.bottom + "px";
  }
  hide () {
    this.tooltip.hide();
    return super.hide();
  }
  show () {
    this.tooltip.show();
    return super.show();
  }
  /**Add a choice to the box
   * @param {string} id
   * @param {string} title 
   * @param {string} tooltip 
   */
  choice(id, title, tooltip) {
    let choice = new Choice()
      .title(title)
      .tooltip(tooltip)
      .mount(this.element)
      .id(id)
      .on("mouseenter", (evt)=>this.onTooltip(choice));
    
    this.choices.push(choice);
    return this;
  }
  /**Get a choice from the user - non self-chainable function
   * @returns {Promise<string>} chosen options
   */
  choose () {
    this.show();
    return new Promise((resolve, reject)=>{
      this.element.addEventListener("click", (evt)=>this.listener(resolve, reject, evt));
    });
  }
}

export { ChoiceBox, Choice };
