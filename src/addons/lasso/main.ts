
import type { API } from "../../api";

export function init (api: API) {
  api.register_tool({
    id: "lasso",
    name: "Lasso",
    iconSrc: "icon.svg",
    description: "Wrangle up some pixels"
  });
  
}
