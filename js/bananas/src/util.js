export function hslToRgb(h, s, l) {
    function hueToRgb(p, q, t) {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    }
  
    if (s === 0) {
      return [l, l, l]; // achromatic
    }
  
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    const r = hueToRgb(p, q, h + 1 / 3);
    const g = hueToRgb(p, q, h);
    const b = hueToRgb(p, q, h - 1 / 3);
  
    return [r, g, b];
}
  
export function blueToRedGradient(value) {
    if(value > 1) value = 1;
    else if (value < 0) value = 0;
    const h = (1  - value) * (240 / 360); // hue value for blue-to-red gradient
    const s = 1;
    const l = 0.5;
    const [r, g, b] = hslToRgb(h, s, l);
  
    return {
      r,
      g,
      b,
    };
}