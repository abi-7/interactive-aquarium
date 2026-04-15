export function lighten(hex, f) {
  const n = parseInt(hex.replace('#',''), 16);
  return `rgb(${Math.min(255,((n>>16)&255)+(f*255|0))},${Math.min(255,((n>>8)&255)+(f*255|0))},${Math.min(255,(n&255)+(f*255|0))})`;
}

export function darken(hex, f) {
  const n = parseInt(hex.replace('#',''), 16);
  return `rgb(${Math.max(0,((n>>16)&255)-(f*255|0))},${Math.max(0,((n>>8)&255)-(f*255|0))},${Math.max(0,(n&255)-(f*255|0))})`;
}

// Returns {x, y} in screen pixels for a MediaPipe normalised point {x, y}.
// The video is CSS-mirrored (scaleX(-1)), so we flip x before remapping.
export function videoToScreen(nx, ny, W, H) {
  const v = document.getElementById('videoEl');
  const vw = v.videoWidth  || 1280;
  const vh = v.videoHeight || 720;

  // Scale that object-fit:cover uses (fills screen, may crop one axis)
  const scale = Math.max(W / vw, H / vh);
  const rendW = vw * scale;
  const rendH = vh * scale;
  // Top-left offset of the rendered (possibly cropped) video in screen space
  const offX = (W - rendW) / 2;
  const offY = (H - rendH) / 2;

  // MediaPipe gives coords in raw video space; mirror x to match CSS scaleX(-1)
  const mx = (1 - nx) * rendW + offX;
  const my =      ny  * rendH + offY;
  return { x: mx, y: my };
}
