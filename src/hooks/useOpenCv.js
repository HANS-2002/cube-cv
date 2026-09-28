import { useState, useEffect } from 'react';

/**
 * useOpenCv — Custom hook that tracks whether OpenCV.js has
 * finished loading from the CDN script in index.html.
 *
 * Returns: { loaded: boolean, cv: object | null }
 *
 * OpenCV.js v5+ exposes `window.cv` which may be:
 *   1. A Promise that resolves to the ready module
 *   2. A module object that needs onRuntimeInitialized
 *   3. A ready module with cv.Mat already available
 * This hook handles all three patterns.
 */
export default function useOpenCv() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function initCv() {
      // Wait for the script to define window.cv
      while (!window.cv) {
        if (cancelled) return;
        await new Promise((r) => setTimeout(r, 200));
      }

      let cv = window.cv;

      // Case 1: cv is a Promise (common in v5 WASM builds)
      if (cv instanceof Promise) {
        cv = await cv;
        window.cv = cv; // replace the promise with the resolved module
      }

      // Case 2: cv exists but Mat is not yet available — wait for runtime init
      if (!cv.Mat) {
        await new Promise((resolve) => {
          // Try setting onRuntimeInitialized
          if (typeof cv.onRuntimeInitialized === 'function') {
            // Already has a callback; wrap it
            const original = cv.onRuntimeInitialized;
            cv.onRuntimeInitialized = () => {
              original();
              resolve();
            };
          } else {
            cv.onRuntimeInitialized = () => resolve();
          }
        });
      }

      // Case 3: cv.Mat is available — we're ready
      if (!cancelled) {
        setLoaded(true);
      }
    }

    initCv().catch((err) => {
      console.error('OpenCV.js initialization failed:', err);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return { loaded, cv: loaded ? window.cv : null };
}
