import { useState, useEffect } from 'react';

/**
 * useOpenCv — Custom hook that tracks whether OpenCV.js has
 * finished loading from the CDN script in index.html.
 *
 * Returns: { loaded: boolean, cv: object | null }
 *
 * OpenCV.js exposes `window.cv` once ready. Since it's loaded
 * async, we poll until `cv.Mat` is available (indicates full init).
 */
export default function useOpenCv() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // If already loaded (e.g. cached), set immediately
    if (window.cv && window.cv.Mat) {
      setLoaded(true);
      return;
    }

    // OpenCV.js defines an `onRuntimeInitialized` callback when
    // loaded via the Emscripten module pattern. But the CDN build
    // may already have fired it, so we also poll as a fallback.
    const interval = setInterval(() => {
      if (window.cv && window.cv.Mat) {
        setLoaded(true);
        clearInterval(interval);
      }
    }, 200);

    return () => clearInterval(interval);
  }, []);

  return { loaded, cv: loaded ? window.cv : null };
}
