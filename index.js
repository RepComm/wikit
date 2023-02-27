import { exponent, UIBuilder } from "@roguecircuitry/htmless";
import { API } from "./api.js";
import { Renderer } from "./renderer.js";
async function main() {
  let ui = new UIBuilder();
  ui.default(exponent);
  ui.create("style").style({
    "body": {
      fontFamily: "courier",
      color: "white"
    },
    "#container": {
      flexDirection: "column"
    },
    ".split-ver": {
      flexDirection: "column"
    },
    ".split-hor": {
      flexDirection: "row"
    },
    "#editor": {
      flex: "5",
      backgroundImage: "url(./textures/bg.svg)",
      backgroundColor: "#404040"
    },
    "#below-menu": {
      flex: "20"
    },
    "#menu-bar": {
      backgroundColor: "#5b606c"
    },
    "#tools, #options": {
      backgroundColor: "#959ba9"
    },
    "#tools": {
      flexDirection: "column"
    },
    ".tool": {
      maxHeight: "4em",
      backgroundColor: "#505050",
      borderRadius: "0.25em",
      cursor: "pointer",
      margin: "1px",
      transition: "border-left-width 0.5s",
      borderTopWidth: "0"
    },
    ".tool:hover": {
      backgroundColor: "#506070"
    },
    ".tool-active": {
      borderLeftColor: "#00ffde",
      borderLeftStyle: "solid",
      borderLeftWidth: "1em"
    },
    ".tool-name": {
      paddingTop: "1em",
      textAlign: "center",
      display: "block",
      margin: "0.5em"
    },
    ".tool-icon": {
      backgroundSize: "contain",
      backgroundRepeat: "no-repeat",
      flex: "0.5"
    },
    "#title": {
      fontSize: "x-large",
      paddingTop: "0.4em",
      paddingLeft: "1em"
    },
    "#tooltip": {
      position: "absolute",
      backgroundColor: "#00bcd48f",
      padding: "0.5em",
      borderRadius: "0 1em 1em 1em"
    },
    "#options": {
      flexDirection: "column"
    },
    ".options": {
      flexDirection: "column"
    },
    ".options-title-container": {
      textAlign: "center",
      backgroundColor: "#2a2a2a",
      backgroundImage: "url(./textures/glimmer.svg)",
      backgroundPosition: "-150% 0%",
      backgroundRepeat: "no-repeat",
      paddingTop: "1em",
      paddingBottom: "1em",
      borderTopColor: "#18fffb",
      borderTopWidth: "0.5em",
      borderTopStyle: "solid",
      maxHeight: "1em",
      overflow: "hidden",
      transition: "background-position 0.8s"
    },
    ".options-title-container:hover": {
      backgroundPosition: "300% 0%"
    },
    ".options-title": {
      width: "100%",
      left: "-100%",
      position: "relative",
      animation: "slide 0.25s forwards",
      animationDelay: "0.1s"
    },
    "@keyframes slide": {
      "100%": {
        left: "0"
      }
    },
    ".option": {
      maxHeight: "2em"
    },
    ".option-input": {
      maxWidth: "50%",
      backgroundColor: "#394650",
      width: "50%",
      border: "none",
      borderRadius: "0 1.5em 1.5em 0",
      margin: "1px",
      padding: "0 1em 0 1em",
      cursor: "pointer"
    },
    ".option-label": {
      maxWidth: "50%",
      width: "50%",
      borderRadius: "1.5em 0 0 1.5em",
      backgroundColor: "#747c87",
      textAlign: "center",
      lineHeight: "2em",
      margin: "1px"
    }
  }).mount(document.head);
  ui.create("div").id("container").mount(document.body);
  let container = ui.e;
  let splitV = ui.create("div").classes("split-ver").mount(container).e;
  let menubar = ui.create("div", "menu-bar").mount(splitV).e;
  ui.create("span", "title").textContent("WIKit").mount(menubar);
  let splitH = ui.create("div", "below-menu").classes("split-hor").mount(splitV).e;
  let tools = ui.create("div", "tools").mount(splitH).e;
  let editor = ui.create("div", "editor").mount(splitH).e;
  let options = ui.create("div", "options").mount(splitH).e;
  let api = new API();
  api.events.on("register_addon", addon => {
    console.log("Loading addon", addon.id);
  });
  let tooltipElement = ui.create("div", "tooltip").mount(tools).e;
  const tooltip = {
    show(msg, x, y) {
      ui.ref(tooltipElement).style({
        left: `${x}px`,
        top: `${y}px`,
        display: "unset"
      }).textContent(msg);
    },
    hide() {
      ui.ref(tooltipElement).style({
        display: "none"
      });
    }
  };
  tooltip.hide();
  api.events.on("register_tool", tool => {
    // console.log("Register Tool", tool.id);
    if (!tool.elements) tool.elements = {};
    tool.elements.button = ui.create("div").classes("tool").on("click", evt => {
      api.events.fire("set_active_tool", {
        tool
      });
    }).on("mousemove", evt => {
      tooltip.show(tool.description, evt.clientX + 10, evt.clientY + 10);
    }).on("mouseleave", evt => {
      tooltip.hide();
    }).mount(tools).e;
    tool.elements.name = ui.create("div").classes("tool-name").textContent(tool.name).mount(tool.elements.button).e;
    if (tool.iconSrc) {
      ui.create("div").style({
        backgroundImage: `url(${api.resolvePath(tool.id)}${tool.iconSrc})`
      }).classes("tool-icon").mount(tool.elements.button);
    }
    tool.elements.optionsContainer = ui.create("div").classes("options").e;
    let tc = ui.create("div").classes("options-title-container").mount(tool.elements.optionsContainer).e;
    ui.create("span").classes("options-title").textContent(`${tool.name} Options`).mount(tc);
    if (!tool.options) return;
    for (let id in tool.options) {
      let option = tool.options[id];
      let o = ui.create("div", `option-${id}`, "option").mount(tool.elements.optionsContainer).e;
      let l = ui.create("span", `option-${id}-label`, "option-label").textContent(option.name).mount(o);
      let inp = ui.create("input").classes("option-input").e;
      inp.type = option.type;
      let onchange = () => {
        switch (option.type) {
          case "number":
            option.value = inp.valueAsNumber;
            break;
          case "color":
            inp.style["background-color"] = inp.value;
          default:
            option.value = inp.value;
            break;
        }
      };
      ui.on("change", onchange).mount(o).e;
      if (option.value !== undefined) {
        inp.value = `${option.value}`;
      } else {
        inp.value = `${option.params.default}`;
      }
      onchange();
    }
  });
  api.events.on("set_active_tool", msg => {
    //clear active CSS, and options for other tools
    for (let [id, _tool] of api.tools) {
      ui.ref(_tool.elements.button).classesRemove("tool-active");
      _tool.elements.optionsContainer.remove();
    }
    let {
      tool
    } = msg;

    //set active display CSS for this tool
    ui.ref(tool.elements.button).classes("tool-active");

    //show options
    ui.ref(tool.elements.optionsContainer).mount(options);
  });
  api.fetchAddonsJson(); //load addons

  let canvas = ui.create("canvas", "renderer").mount(editor).e;
  let renderer = new Renderer(canvas);
  renderer.start();
}
main();