
import { API } from "./api.js";
import { Menu } from "./components/menu.js";
import { Viewer } from "./components/viewer.js";
import { ChoiceBox } from "./components/choicebox.js";
import { get, on, off } from "./utils/aliases.js";

/**File open dialog
 * Returns a promise that contains the files
 * @returns {Promise<Array<File>>}
 */
let fget = () => {
  return new Promise((resolve, reject) => {
    let fin = get("f-in");
    let listener = () => {
      if (fin.files.length === 0) {
        reject("No files opened");
      } else {
        resolve(fin.files);
      }
      fin.removeEventListener("change", listener);
    };
    on(fin, "change", listener);
    fin.click();
  });
}
let fset = (buffer, mimeType, name = "output.png") => {
  let element = get("f-out");
  element.download = name;
  element.href = buffer;
  element.click();
}

let menu = new Menu("menu-main", get("menu-main"), get("menu-subdisplay"));
get("menu-subdisplay").addEventListener("mouseleave", () => menu.hideSubMenu());

let fileOpenOptions = new ChoiceBox("How would you like to open this image?")
  .choice("new-image", "as new project", "Frees data and loads as a layer")
  .choice("active-layer","into active layer", "Places into the active layer image")
  .choice("add-layer","as new layer", "Creates a layer")
  .mount(document.body);

let menuFile = menu.add("File", (e) => e.preventDefault())
  .sub("New", () => { })
  .sub("Open (CTRL+O)", async () => {
    let files = await fget();
    if (!files.length > 0) return;

    let fr = new FileReader();
    on(fr, "load", (evt) => {
      let img = new Image();
      on(img, "load", async () => {
        let choice = await fileOpenOptions.choose();
        let l;
        switch (choice) {
          case "new-image":
            //TODO - free layers and draw main as new image
            break;
          case "active-layer":
            if (viewer.layers.length < 0) {
              viewer.addLayer("main");
            }
            viewer.ctxActive.drawImage(img, 0, 0);
            break;
          case "active-layer":
            let name = files.item(0).name;
            createImageBitmap(img).then((ib) => {
              l = viewer.addLayer(name, ib);
              viewer.setActiveLayer(l);
            });
            break;
        }
      });
      img.src = evt.target.result;
    });
    fr.readAsDataURL(files[0]);
  });

menuFile.sub("Save (CTRL+S)", () => {
  viewer.renderCompositePNG((png) => {
    let name = prompt("Exported File Name:", "export.png");
    if (name === null) return;
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

// let viewer = new Viewer();

// viewer.mount(get("middle"));
// viewer.addLayer("main");

let api = new API();
//api.setViewer(viewer);

fetch("./tools/package.json").then(resp => resp.json().then((pkg) => {
  for (let toolInfo of pkg.installed) {
    if (toolInfo.enabled) {
      import("../tools/" + toolInfo.name + "/" + toolInfo.file).then((mod) => {
        mod.default(api);
      }).catch((ex) => {
        throw ex;
      });
    }
  }
}));

let fsl = async ()=>{
  if (document.fullscreenElement !== null) {
    return;
  }
  document.body.requestFullscreen({
    navigationUI:"hide"
  }).then(()=>{
    //alert("You are now in fullscreen mode");
    let viewer = new Viewer();

    viewer.mount(get("middle"));
    viewer.addLayer("main");

    api.setViewer(viewer);
    api.viewer.resize();
  }).catch((reason)=>{
    //alert(reason);
  });
};
on(window, "click", fsl);