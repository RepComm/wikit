
import {API} from "./api.js";

import { Menu, MenuItem } from "./components/menu.js";
import { Viewer } from "./components/viewer.js";
import { ChoiceBox } from "./components/choicebox.js";
import ToolBox from "./components/toolbox.js";

let get = (id) => document.getElementById(id);
/**Remove element's children
 * @param {HTMLElement} element 
 */
let removeChildren = (element, classMatch = undefined) => {
  for (let child of element.children) {
    if (classMatch === undefined || classMatch === "*" || child.classList.contains(classMatch)) {
      child.remove();
    }
  }
};
let fget = (cb) => {
  /**@type {HTMLInputElement} */
  let fin = get("f-in");
  let listener = (evt) => {
    cb(fin.files);
    fin.removeEventListener("change", listener);
  };
  fin.addEventListener("change", listener);
  fin.click();
}
let fset = (buffer, mimeType, name = "output.png") => {
  let element = get("f-out");
  element.download = name;
  element.href = buffer;
  element.click();
}

let menu = new Menu("menu-main", get("menu-main"), get("menu-subdisplay"));
get("menu-subdisplay").addEventListener("mouseleave", () => menu.hideSubMenu());

let openOptionsBox = new ChoiceBox("How would you like to open this image?");
openOptionsBox.addOption("nimage", "As A New Project", "Frees all data and loads as new image");
openOptionsBox.addOption("alayer", "Into the Active Layer", "Adds to the active layer");
openOptionsBox.addOption("nlayer", "As A New Layer", "Adds to a new layer");
openOptionsBox.mount(document.body);

let menuFile = menu.add("File", () => (e) => e.preventDefault());
menuFile.sub("New", () => {
});
menuFile.sub("Open (CTRL+O)", () => {
  fget((files) => {
    if (files.length > 0) {
      let fr = new FileReader();
      fr.addEventListener("load", (evt) => {
        let img = new Image();
        img.addEventListener("load", (evt) => {
          openOptionsBox.trigger((choice) => {
            let l;
            switch (choice) {
              case "nimage":
                //TODO - free layers and draw main as new image
                break;
              case "alayer":
                if (viewer.layers.length < 0) {
                  viewer.addLayer("main");
                }
                viewer.ctxActive.drawImage(img, 0, 0);
                break;
              case "nlayer":
                let name = files.item(0).name;
                createImageBitmap(img).then((ib) => {
                  l = viewer.addLayer(name, ib);
                  viewer.setActiveLayer(l);
                });
                break;
            }
          });
        });
        img.src = evt.target.result;
      });
      fr.readAsDataURL(files[0]);
    }
  });
});
menuFile.sub("Save (CTRL+S)", () => {
  viewer.renderCompositePNG((png) => {
    let name = prompt("Exported File Name:", "export.png");
    fset(png, "application/octet-stream", name);
  })
});

let menuEdit = menu.add("Edit", (e) => e.preventDefault());
menuEdit.sub("Undo (CTRL+Z)", () => {
  alert("Undo");
});
menuEdit.sub("Redo (CTRL+Y)", () => {
  alert("Redo");
});
menuEdit.sub("Copy (CTRL+C)", () => {
  alert("Copy");
});
menuEdit.sub("Paste (CTRL+V)", () => {
  alert("Paste");
});
menuEdit.sub("Preferences", () => {
  alert("Preferences");
});

let menuHelp = menu.add("Help", (e) => e.preventDefault());
menuHelp.sub("About", () => {
  alert("WiKiT v 1.0.1\nWeb Image Kit\nAn HTML5 raster graphics software");
});
menuHelp.sub("Docs", () => {
  alert("Not implemented yet");
});

let viewer = new Viewer();

viewer.mount(get("middle"));
viewer.addLayer("main");
window.viewer = viewer;
window.addEventListener("resize", ()=>{
  viewer.recalcDrawRect();
  viewer.resize();
  viewer.renderLayers();
});

let toolbox = new ToolBox("ToolBox", viewer);
let api = new API();

fetch("./tools/package.json").then(resp => resp.json().then((pkg) => {
  for (let toolInfo of pkg.installed) {
    if (toolInfo.enabled) {
      import("../tools/" + toolInfo.name + "/" + toolInfo.file).then((mod) => {
        mod.default(api);
      }).catch((ex) => {
        // console.log("Error while importing module", ex);
        throw ex;
      });

    }
  }
}));

toolbox.mount(get("left"));
