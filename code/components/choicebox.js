
import { make, on, rect } from "../aliases.js";

class Choice {
  constructor () {
    this.element = make("span");
    this.element.classList.add("choicebox-option");
    this.choicebox = undefined;
  }
  title (txt) {
    this.element.textContent = txt;
    return this;
  }
  tooltip (txt) {
    this._tooltip = txt;
    return this;
  }
  mount (parent) {
    parent.appendChild(this.element);
    return this;
  }
  /**Set the ID of the element
   * @param {string} v 
   */
  id (v) {
    this.element.id = v;
    return this;
  }
}

class ChoiceBox {
  constructor() {
    /**@type {Array<Choice>} */
    this.choices = new Array();

    this.element = make("div");
    this.element.classList.add("choicebox");
    
    this.tooltip = make("div");
    this.tooltip.classList.add("choicebox-tooltip");

    this.hide();
    document.body.appendChild(this.tooltip);

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
    this.tooltip.style.display = "unset";
    this.tooltip.textContent = choice._tooltip;
    let r = rect(choice.element);
    this.tooltip.style.left = r.left + "px";
    this.tooltip.style.top = r.bottom + "px";
  }
  hide () {
    this.element.style.display = "none";
    this.tooltip.style.display = "none";
    return this;
  }
  show () {
    this.element.style.display = "";
    return this;
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
      .id(id);
    on(choice.element, "mouseenter", (evt)=>this.onTooltip(choice));
    this.choices.push(choice);
    return this;
  }
  mount(parent) {
    parent.appendChild(this.element);
    return this;
  }
  /**Get a choice from the user
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
