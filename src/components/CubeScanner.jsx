import { useRef, useCallback, useEffect, useState } from 'react';
import Webcam from 'react-webcam';

/**
 * CubeScanner — Webcam feed with a 3×3 grid overlay.
 *
 * Props:
 *   @param {boolean}  opencvReady  — Whether OpenCV.js is loaded.
 *   @param {string}   currentFace  — Which face is being scanned (U/R/F/D/L/B).
 *   @param {Function} onCapture    — Callback: (videoElement, gridRect) => void.
 *   @param {string[]} capturedColors — Array of 9 colors for this face (or null).
 *   @param {boolean}  disabled     — Disable capture button.
 */

// Face label display names and colors
const FACE_INFO = {
  U: { label: 'Up (White)',   color: '#ffffff' },
  R: { label: 'Right (Red)',  color: '#ef4444' },
  F: { label: 'Front (Green)', color: '#22c55e' },
  D: { label: 'Down (Yellow)', color: '#fbbf24' },
  L: { label: 'Left (Orange)', color: '#f97316' },
  B: { label: 'Back (Blue)',  color: '#3b82f6' },
};

// Color character → CSS color for the preview dots
const COLOR_CSS = {
  U: 'var(--color-cube-white)',
  R: 'var(--color-cube-red)',
  F: 'var(--color-cube-green)',
  D: 'var(--color-cube-yellow)',
  L: 'var(--color-cube-orange)',
  B: 'var(--color-cube-blue)',
};

const VIDEO_CONSTRAINTS = {
  width: 640,
  height: 480,
  facingMode: 'environment', // prefer rear camera on mobile
};

export default function CubeScanner({
  opencvReady,
  currentFace,
  onCapture,
  capturedColors,
  disabled,
}) {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const [videoReady, setVideoReady] = useState(false);

  // Compute the grid rect in video-native coordinates
  const getGridRect = useCallback(() => {
    const video = webcamRef.current?.video;
    if (!video) return null;
    const vw = video.videoWidth;
    const vh = video.videoHeight;
    const size = Math.min(vw, vh) * 0.55; // grid covers 55% of shorter axis
    const x = (vw - size) / 2;
    const y = (vh - size) / 2;
    return { x, y, size };
  }, []);

  // Draw the 3×3 overlay grid on the canvas every frame
  const drawOverlay = useCallback(() => {
    const video = webcamRef.current?.video;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState < 2) {
      animationRef.current = requestAnimationFrame(drawOverlay);
      return;
    }

    const vw = video.videoWidth;
    const vh = video.videoHeight;
    canvas.width = vw;
    canvas.height = vh;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, vw, vh);

    const grid = getGridRect();
    if (!grid) {
      animationRef.current = requestAnimationFrame(drawOverlay);
      return;
    }

    const { x, y, size } = grid;
    const cell = size / 3;

    // Draw grid lines
    ctx.strokeStyle = 'rgba(124, 58, 237, 0.7)';
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 4]);

    // Outer border
    ctx.strokeRect(x, y, size, size);

    // Inner grid lines
    ctx.setLineDash([]);
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = 'rgba(124, 58, 237, 0.5)';
    for (let i = 1; i < 3; i++) {
      // Vertical
      ctx.beginPath();
      ctx.moveTo(x + cell * i, y);
      ctx.lineTo(x + cell * i, y + size);
      ctx.stroke();
      // Horizontal
      ctx.beginPath();
      ctx.moveTo(x, y + cell * i);
      ctx.lineTo(x + size, y + cell * i);
      ctx.stroke();
    }

    // If we have captured colors, draw colored circles in each cell
    if (capturedColors && capturedColors.length === 9) {
      const radius = cell * 0.25;
      capturedColors.forEach((c, idx) => {
        const row = Math.floor(idx / 3);
        const col = idx % 3;
        const cx = x + cell * (col + 0.5);
        const cy = y + cell * (row + 0.5);

        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.fillStyle = COLOR_CSS[c] || '#888';
        ctx.globalAlpha = 0.85;
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.strokeStyle = 'rgba(255,255,255,0.5)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      });
    }

    // Center crosshair for alignment
    const centerX = x + size / 2;
    const centerY = y + size / 2;
    ctx.strokeStyle = 'rgba(6, 182, 212, 0.6)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(centerX - 12, centerY);
    ctx.lineTo(centerX + 12, centerY);
    ctx.moveTo(centerX, centerY - 12);
    ctx.lineTo(centerX, centerY + 12);
    ctx.stroke();
    ctx.setLineDash([]);

    animationRef.current = requestAnimationFrame(drawOverlay);
  }, [capturedColors, getGridRect]);

  // Start/stop the overlay animation loop
  useEffect(() => {
    if (videoReady) {
      animationRef.current = requestAnimationFrame(drawOverlay);
    }
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [videoReady, drawOverlay]);

  // Handle the "Capture Face" button
  const handleCapture = useCallback(() => {
    const video = webcamRef.current?.video;
    const grid = getGridRect();
    if (video && grid && onCapture) {
      onCapture(video, grid);
    }
  }, [getGridRect, onCapture]);

  const faceInfo = FACE_INFO[currentFace] || FACE_INFO.U;

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Face indicator badge */}
      <div className="flex items-center gap-2 text-sm font-medium">
        <span
          className="w-3 h-3 rounded-full inline-block"
          style={{ backgroundColor: faceInfo.color }}
        />
        <span className="text-slate-300">
          Scanning: <span className="text-white font-semibold">{faceInfo.label}</span>
        </span>
      </div>

      {/* Webcam + overlay container */}
      <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl animate-pulse-glow">
        <Webcam
          ref={webcamRef}
          audio={false}
          videoConstraints={VIDEO_CONSTRAINTS}
          onUserMedia={() => setVideoReady(true)}
          className="block w-full max-w-[640px]"
          style={{ transform: 'scaleX(-1)' }}
        />
        {/* Overlay canvas — positioned exactly over the video */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ transform: 'scaleX(-1)' }}
        />
      </div>

      {/* Capture button */}
      <button
        id="capture-face-btn"
        className="btn-accent text-base mt-2"
        onClick={handleCapture}
        disabled={disabled || !videoReady || !opencvReady}
      >
        {!opencvReady
          ? '⏳ Loading OpenCV…'
          : !videoReady
            ? '📷 Starting Camera…'
            : `📸 Capture ${currentFace} Face`}
      </button>
    </div>
  );
}
