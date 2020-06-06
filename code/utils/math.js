let Utils = {
  /** Convert two dimensional coordinates to a one dimensional index
   * @param {number} x coordinate
   * @param {number} y coordinate
   * @param {number} width of bounding grid
   */
  TwoDimToIndex(x, y, width) {
    return x + width * y;
  },
  /** Convert one dimensional index to two dimensional X coordinate
   * @param {number} index one dimensional offset index
   * @param {number} width of bounding grid
   */
  IndexToTwoDimX(index, width) {
    return index % width;
  },
  /** Convert one dimensional index to two dimensional Y coordinate
   * @param {number} index one dimensional offset index
   * @param {number} width of bounding grid
   */
  IndexToTwoDimY(index, width) {
    return index / width;
  },
  /** Round *n* to the next increment of *next* argument
   * @param {Number} n to round
   * @param {Number} next round up to in increments of this number
   */
  roundToNext(n, next) {
    let isNeg = (n < 0);
    if (isNeg) { n -= next };
    let resto = n % next;
    if (resto <= (next)) {
      return n - resto;
    } else {
      return n + next - resto;
    }
  },
  /** Regular round, but with added 'to' option
   * @param {Number} n number to round
   * @param {Number} to round to
   */
  roundTo(n, to) {
    var resto = n % to;
    if (resto <= (to / 2)) {
      return n - resto;
    } else {
      return n + to - resto;
    }
  },
  /**Maximum in an array of float 32s
   * @param {Float32Array} array 
   */
  float32Max (array) {
    let result = -Infinity;
    let current;
    for (let i=0; i<array.length; i++) {
      current = Math.abs(array[i]);
      if (current > result) result = current;
    }
    return result;
  }
};

/**Convert degrees to radians
 * @param {number} degrees
 * @returns {number} radians
 */
let radians = (degrees) => degrees * (pi / 180);

/**Convert radians to degrees
 * @param {number} radians
 * @returns {number} degrees
 */
let degrees = (radians) => radians * (180 / pi);

/**Linear interpolate between a and b by c
 * @param {number} a any number
 * @param {number} b any number
 * @param {number} c between 0 and 1 to clamp between a and b
 * @returns {number}
 */
let lerp = (a, b, c) => a + c * (b - a);

/**Get the distance between two 2d points
 * @param {number} x1
 * @param {number} y1
 * @param {number} x2
 * @param {number} y2
 * @returns {number} distance
*/
let dist = (x1, y1, x2, y2) => Math.sqrt(
  Math.pow(x1 - x2, 2) +
  Math.pow(y1 - y2, 2)
);

/**Get the distance between two numbers
 * @param {number} n1 
 * @param {number} n2 
 * @returns {number}
 */
let ndist = (n1, n2) => Math.abs(Math.abs(n1) - Math.abs(n2));

/**Get the angle made by two points from a tangent pointing right
 * @param {number} x1 
 * @param {number} y1 
 * @param {number} x2 
 * @param {number} y2
 * @returns {number} radians
 */
let angle = (x1, y1, x2, y2) => {
  return Math.atan2(y1 - y2, x1 - x2);
}

export { Utils, dist, lerp, degrees, radians, ndist, angle };