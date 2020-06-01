
class ChoiceBox {
    constructor () {
        this.options = new Array();
        this.listener;

        this.clickListener = (evt)=>{
            if (this.listener) {
                this.listener(evt.target.id);
            }
            this.element.style.display = "none";
        };
        this.hoverListener = (evt, option)=>{
            this.tooltip.innerText = option.tooltip;
            let r = evt.target.getBoundingClientRect();
            this.tooltip.style.top = r.bottom + "px";
            this.tooltip.style.left = r.left + "px";

            this.tooltip.style.display = "block";
        };

        this.element = document.createElement("div");
        this.element.classList.add("choicebox");
        this.element.style.display = "none";
        this.tooltip = document.createElement("div");
        this.tooltip.classList.add("choicebox-tooltip");
        this.element.appendChild(this.tooltip);
    }
    addOption (id, name, tooltip) {
        let option = {
            id:id,
            tooltip:tooltip,
            name:name,
            buttonElement:document.createElement("button")
        };
        option.buttonElement.id = id;
        option.buttonElement.textContent = name;
        option.buttonElement.classList.add("choicebox-option");
        option.buttonElement.addEventListener("click", this.clickListener);
        option.buttonElement.addEventListener("mouseenter", (evt)=>{
            this.hoverListener(evt, option);
        });
        this.element.appendChild(option.buttonElement);
    }
    trigger (listener) {
        this.element.style.display = "block";
        this.listener = listener;
    }
    mount (parent) {
        parent.appendChild(this.element);
    }
}

export {ChoiceBox};
