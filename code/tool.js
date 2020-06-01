
class Tool {
    /**@param {String} name of tool
     * @param {String} icon url of icon to use
     * @param {API} api provided
     */
    constructor (name, icon, api) {
        /**@type {import("./api.js").default} */
        this.api = api;
        this.name = name;
        /**@type {HTMLImageElement} */
        this.element = document.createElement("div");
        this.element_text = document.createElement("span");
        this.element_text.classList.add("tool-select-text");
        this.element_text.textContent = this.name;
        this.element_icon = document.createElement("img");
        this.element_icon.classList.add("tool-select-icon");
        this.element.appendChild(this.element_icon);
        this.element.appendChild(this.element_text);

        this.element.classList.add("tool-select", "fontbody");
        if (icon) {
            this.icon = icon;
            this.element_icon.setAttribute("src", this.icon);
        }

        this.nextIsNewStroke = false;
    }

    setIcon (icon) {
        this.icon = icon;
        this.element_icon.setAttribute("src", this.icon);
    }

    onDraw (ctx, x, y) {

    }

    onFinishDraw (ctx, x, y) {

    }

    onOptChange () {
        
    }

    getOptions () {
        
    }
}

export default Tool;
