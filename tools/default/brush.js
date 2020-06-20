
import { dist, angle, lerp } from "../../code/utils/math.js";
import { Brush, API } from "../../code/api.js";

/**@param {API} api*/
export default function onRegister(api) {
  let tool = new DefaultBrush();
  api.registerBrush(tool);
  api.addPaletteButton(tool).icon("./tools/default/brush-icon.svg");
}

class DefaultBrush extends Brush {
  constructor() {
    super("Default brush");
    //Distance between last and current points
    this.pointDist = 0;

    //Angle between last and current points
    this.langle = 0;
    this.angle = 0;

    //The perpendicular of angle
    this.perpendicular = 0;

    this.points = {
      bl: { x: 0, y: 0 },
      br: { x: 0, y: 0 },
      tl: { x: 0, y: 0 },
      tr: { x: 0, y: 0 }
    };
  }

  onStroke(ctx, x, y, lx, ly) {
    this.pointDist = dist(x, y, lx, ly);
    this.angle = angle(x, y, lx, ly);
    let closeFactor = (1 / ((Math.abs(x) - Math.abs(lx)) + 0.01)) / 100;
    if (closeFactor > 1) closeFactor = 1;

    this.angle = lerp(this.angle, this.langle, closeFactor);
    this.langle = this.angle;
    this.perpendicular = this.angle + Math.PI / 2;

    if (this.isNewStroke) {
      this.isNewStroke = false;
      this.points.tl.x = x + (Math.cos(this.perpendicular) * Brush.width);
      this.points.tl.y = y + (Math.sin(this.perpendicular) * Brush.width);

      this.points.tr.x = x - (Math.cos(this.perpendicular) * Brush.width);
      this.points.tr.y = y - (Math.sin(this.perpendicular) * Brush.width);

      copyPointToPoint(this.points.bl, this.points.tl);
      copyPointToPoint(this.points.br, this.points.tr);
    } else {
      //Not a permafix but it looks better than underlapping by a subpixel
      //Also doesn't work with transparency yet
      this.points.bl.x = lerp(this.points.bl.x, this.points.tl.x, 0.98);
      this.points.bl.y = lerp(this.points.bl.y, this.points.tl.y, 0.98);
      // this.points.bl.x = this.points.tl.x;
      // this.points.bl.y = this.points.tl.y;
      this.points.br.x = lerp(this.points.br.x, this.points.tr.x, 0.98);
      this.points.br.y = lerp(this.points.br.y, this.points.tr.y, 0.98);
      // this.points.br.x = this.points.tr.x;
      // this.points.br.y = this.points.tr.y;

      this.points.tl.x = x + (Math.cos(this.perpendicular) * Brush.width);
      this.points.tl.y = y + (Math.sin(this.perpendicular) * Brush.width);

      this.points.tr.x = x - (Math.cos(this.perpendicular) * Brush.width);
      this.points.tr.y = y - (Math.sin(this.perpendicular) * Brush.width);
    }
    // if (lineObjCollision(
    //   this.points.bl,
    //   this.points.br,
    //   this.points.tl,
    //   this.points.tr
    // )) {
    //   copyPointToPoint(this.points.bl, this.points.tl);
    //   // copyPointToPoint(this.points.tr, this.points.br);
    //   console.log("collides");
    // }

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

function copyPointToPoint(from, to) {
  to.x = from.x;
  to.y = from.y;
}

// Check the direction these three points rotate
function lineAroundPoint(p1x, p1y, p2x, p2y, p3x, p3y) {
  if (((p3y - p1y) * (p2x - p1x)) > ((p2y - p1y) * (p3x - p1x))) {
    return 1;
  } else if (((p3y - p1y) * (p2x - p1x)) == ((p2y - p1y) * (p3x - p1x))) {
    return 0;
  }
  return -1;
}

/**Check intersection of two lines
 * @param {number} x1 
 * @param {number} y1 
 * @param {number} x2 
 * @param {number} y2 
 * @param {number} x3 
 * @param {number} y3 
 * @param {number} x4 
 * @param {number} y4
 * @returns {boolean} true if interseciton
 */
function lineCollision(x1, y1, x2, y2, x3, y3, x4, y4) {
  let f1 = lineAroundPoint(x1, y1, x2, y2, x4, y4);
  let f2 = lineAroundPoint(x1, y1, x2, y2, x3, y3);
  let f3 = lineAroundPoint(x1, y1, x3, y3, x4, y4);
  let f4 = lineAroundPoint(x2, y2, x3, y3, x4, y4);

  // If the faces rotate opposite directions, they intersect.
  let intersect = f1 != f2 && f3 != f4;
  //We aren't checking if lines are on same line as that isn't necessary for this application
  return intersect;
}

/**Check intersection of two lines
 * @param {{x:number,y:number}} p0 
 * @param {{x:number,y:number}} p1 
 * @param {{x:number,y:number}} p2 
 * @param {{x:number,y:number}} p3 
 */
function lineObjCollision(p0, p1, p2, p3) {
  return lineCollision(p0.x, p0.y, p1.x, p1.y, p2.x, p2.y, p3.x, p3.y);
}