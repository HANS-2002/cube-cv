/**
 * cvProcessor.js — Pure OpenCV.js color detection logic.
 *
 * This module has ZERO React imports. It takes a video element
 * and grid geometry, samples the center region of each of the
 * 9 grid cells, converts to HSV, and classifies each cell's
 * dominant color into one of the 6 standard Rubik's Cube colors.
 *
 * Exports:
 *   detectColors(videoElement, gridRect) → string[]
 *     Returns an array of 9 color characters: 'U','R','F','D','L','B'
 *     mapped from White, Red, Green, Yellow, Orange, Blue respectively.
 */

// ── Color Label Mapping ──────────────────────────────────────
// Standard face-color mapping (Kociemba / cubejs convention):
//   U = White,  R = Red,  F = Green
//   D = Yellow, L = Orange, B = Blue
const COLOR_MAP = {
  white:  'U',
  red:    'R',
  green:  'F',
  yellow: 'D',
  orange: 'L',
  blue:   'B',
};

/**
 * Classify a single HSV pixel sample into one of 6 standard Rubik's
 * Cube face colors.
 *
 * HSV ranges are tuned for OpenCV's convention:
 *   H: 0–180  (degrees/2)
 *   S: 0–255
 *   V: 0–255
 *
 * The key challenge is orange vs red — on a real cube under indoor
 * lighting, orange stickers produce hues in the 5–25 range. Red
 * stickers are typically < 5 or > 165, but can bleed into 5–10.
 * We use saturation and brightness ratios to disambiguate.
 *
 * @param {number} h  Hue        (0–180 in OpenCV convention)
 * @param {number} s  Saturation (0–255)
 * @param {number} v  Value      (0–255)
 * @returns {string}  Color label key (e.g. 'red', 'white')
 */
function classifyHSV(h, s, v) {
  // ── White: low saturation, high brightness ──
  if (s < 60 && v > 150) return 'white';

  // ── Yellow: warm hue, vivid ──
  if (h >= 22 && h <= 38 && s > 70 && v > 100) return 'yellow';

  // ── Orange: hue 5–22, but also check that it's bright and saturated.
  //    Orange stickers are brighter (higher V) and have a warmer tone.
  //    Under some lights, orange can show up with h as low as 3. ──
  if (h >= 3 && h < 22 && s > 70 && v > 130) {
    // In the overlap zone (h 3–10), use brightness to disambiguate:
    // Orange stickers are typically brighter than red ones.
    if (h < 8) {
      // Ambiguous zone: orange if very bright, red otherwise
      return v > 180 ? 'orange' : 'red';
    }
    return 'orange';
  }

  // ── Red: wraps around 0° — two ranges.
  //    Low end: h < 3 (definite red, the deep crimson zone)
  //    High end: h > 165 (wrapping around from 180) ──
  if ((h < 3 || h > 165) && s > 70 && v > 60) return 'red';

  // ── Green: broad mid-hue range ──
  if (h >= 36 && h <= 85 && s > 40 && v > 40) return 'green';

  // ── Blue: upper mid-hue range ──
  if (h >= 86 && h <= 135 && s > 50 && v > 50) return 'blue';

  // ── Fallback — pick the closest by simple heuristic ──
  if (s < 40) return 'white';
  if (h < 8) return (v > 180) ? 'orange' : 'red';
  if (h < 25) return 'orange';
  if (h < 40) return 'yellow';
  if (h < 85) return 'green';
  if (h < 135) return 'blue';
  return 'red';
}

/**
 * Detect the colors of the 9 cells in a 3×3 grid overlaid on a
 * webcam frame.
 *
 * @param {HTMLVideoElement} videoEl  — The playing <video> element.
 * @param {{ x: number, y: number, size: number }} gridRect
 *        — Top-left (x, y) and side length of the square grid,
 *          in the *video's native* coordinate space.
 * @returns {string[]}  Array of 9 facelet characters (U/R/F/D/L/B order).
 */
export function detectColors(videoEl, gridRect) {
  const cv = window.cv;
  if (!cv || !cv.Mat) {
    throw new Error('OpenCV.js is not loaded yet.');
  }

  const { x: gx, y: gy, size: gSize } = gridRect;
  const cellSize = gSize / 3;
  // Sample a 20% square in each cell's center (larger area = more stable reads)
  const sampleRadius = Math.floor(cellSize * 0.20);

  // Draw video frame onto an offscreen canvas to get pixel data
  const canvas = document.createElement('canvas');
  canvas.width = videoEl.videoWidth;
  canvas.height = videoEl.videoHeight;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(videoEl, 0, 0);

  // Read the full frame into an OpenCV Mat
  const src = cv.imread(canvas);
  // Convert BGR→HSV (OpenCV loads canvas as RGBA, so we go RGBA→RGB→HSV)
  const rgb = new cv.Mat();
  const hsv = new cv.Mat();
  cv.cvtColor(src, rgb, cv.COLOR_RGBA2RGB);
  cv.cvtColor(rgb, hsv, cv.COLOR_RGB2HSV);

  const colors = [];

  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      // Center of this grid cell in the video's coordinate space
      const cx = Math.round(gx + cellSize * (col + 0.5));
      const cy = Math.round(gy + cellSize * (row + 0.5));

      // Define a small ROI around the center
      const roiX = Math.max(0, cx - sampleRadius);
      const roiY = Math.max(0, cy - sampleRadius);
      const roiW = Math.min(sampleRadius * 2, hsv.cols - roiX);
      const roiH = Math.min(sampleRadius * 2, hsv.rows - roiY);

      const roi = hsv.roi(new cv.Rect(roiX, roiY, roiW, roiH));
      const mean = cv.mean(roi);
      roi.delete();

      const [h, s, v] = [mean[0], mean[1], mean[2]];
      const colorName = classifyHSV(h, s, v);
      colors.push(COLOR_MAP[colorName]);
    }
  }

  // Clean up all Mats to avoid memory leaks
  src.delete();
  rgb.delete();
  hsv.delete();

  return colors;
}
