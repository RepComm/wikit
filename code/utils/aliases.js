//Get an element by its ID, alias
let get = (id) => document.getElementById(id);
let getByClass = (classname) => document.getElementsByClassName(classname);
/**An alias for e.getBoundingClientRect
 * @param {HTMLElement} e
 * @returns {DOMRect}
 */
let rect = (e) => e.getBoundingClientRect();
//Create an element, alias
let make = (type) => document.createElement(type);
/**Listen to events on an element
 * @param {HTMLElement} elem 
 * @param {string} type 
 * @param {callback} callback 
 * @param {object} options 
 */
let on = (elem, type, callback, options) => {
  if (!elem) throw "No element supplied";
  elem.addEventListener(type, callback, options);
}

/**Stop listen to events on an element
 * @param {HTMLElement} elem 
 * @param {string} type 
 * @param {callback} callback 
 */
let off = (elem, type, callback) => {
  if (!elem) throw "No element supplied";
  elem.removeEventListener(type, callback);
}

let clearChildren = (e)=>{
  while(e.lastChild) {
    e.lastChild.remove();
  }
}

/**Applies the props object key:values to o
 * @param {any} o 
 * @param {any} props 
 */
let setProps = (o, props)=>{
  for (let key in props) {
    o[key] = props[key];
  }
}

/**Apply classes to an element
 * @param {HTMLElement} e Element to apply to
 * @param  {...string} classes classes to apply
 */
let applyStyleClasses = (e, ...classes) => {
  if (!classes) return;
  for (let c of classes) {
    e.classList.add(c);
  }
}

export { get, getByClass, rect, make, on, off, clearChildren, setProps, applyStyleClasses };
