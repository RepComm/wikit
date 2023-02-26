export function init(api) {
  api.register_tool({
    id: "pencil",
    name: "Pencil",
    iconSrc: "icon.svg",
    description: "Generic Pencil",
    options: {
      size: {
        type: "number",
        name: "Size",
        params: {
          min: 1,
          max: 100,
          step: 0.5,
          default: 1
        }
      },
      fg: {
        type: "color",
        name: "Foreground",
        params: {
          default: "#ffffff"
        }
      }
    }
  });
}