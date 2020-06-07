
import { dist, angle } from "../../code/utils/math.js";
import { Brush, API } from "../../code/api.js";

/**@param {API} api*/
export default function onRegister (api) {
  let tool = new DefaultBrush();
  api.registerBrush(tool);
  api.addPaletteButton(tool).icon("./tools/default/brush-icon.svg");
}

class DefaultBrush extends Brush {
  constructor () {
    super("Default brush");
    //Distance between last and current points
    this.pointDist = 0;

    //Angle between last and current points
    this.angle = 0;

    //The perpendicular of angle
    this.perpendicular = 0;

    this.points = {
      bl:{x:0, y:0},
      br:{x:0, y:0},
      tl:{x:0, y:0},
      tr:{x:0, y:0}
    };

    this.isNewStroke = true;
  }

  onEvent(type) {
    if (type === "pointer-up") {
      this.isNewStroke = true;
    }
    if (type === "pointer-move") {
      if (API.Global.input.pointer.leftDown) {
        this.onStroke(
          API.Global.viewer.ctxActive,
          API.Global.input.pointer.x - API.Global.viewer.rect.x,
          API.Global.input.pointer.y - API.Global.viewer.rect.y,
          API.Global.input.pointer.lx - API.Global.viewer.rect.x,
          API.Global.input.pointer.ly - API.Global.viewer.rect.y
        );
      }
    }
  }

  onStroke(ctx, x, y, lx, ly) {
    this.pointDist = dist(x, y, lx, ly);
    this.angle = angle(x, y, lx, ly);
    this.perpendicular = this.angle + Math.PI / 2;

    if (this.isNewStroke) {
      this.isNewStroke = false;
      this.points.tl.x = x + (Math.cos(this.perpendicular) * Brush.width);
      this.points.tl.y = y + (Math.sin(this.perpendicular) * Brush.width);
  
      this.points.tr.x = x - (Math.cos(this.perpendicular) * Brush.width);
      this.points.tr.y = y - (Math.sin(this.perpendicular) * Brush.width);

      this.points.bl.x = this.points.tl.x;
      this.points.bl.y = this.points.tl.y;

      this.points.br.x = this.points.tr.x;
      this.points.br.y = this.points.tr.y;
    } else {
      this.points.bl.x = this.points.tl.x;
      this.points.bl.y = this.points.tl.y;

      this.points.br.x = this.points.tr.x;
      this.points.br.y = this.points.tr.y;

      this.points.tl.x = x + (Math.cos(this.perpendicular) * Brush.width);
      this.points.tl.y = y + (Math.sin(this.perpendicular) * Brush.width);
  
      this.points.tr.x = x - (Math.cos(this.perpendicular) * Brush.width);
      this.points.tr.y = y - (Math.sin(this.perpendicular) * Brush.width);
    }
    
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(this.points.tl.x, this.points.tl.y); //Top left
    ctx.lineTo(this.points.tr.x, this.points.tr.y); //Top right
    ctx.lineTo(this.points.br.x, this.points.br.y); //Bottom right
    ctx.lineTo(this.points.bl.x, this.points.bl.y); //Bottom left
    ctx.closePath();

    ctx.globalAlpha = Brush.opacity;
    ctx.fillStyle = Brush.fgColor;
    
    ctx.fill();

    ctx.restore();
  }
}


