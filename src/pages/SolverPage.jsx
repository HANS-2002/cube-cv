import { useState, useEffect, useCallback, useRef } from 'react';
import CubeScanner from '../components/CubeScanner.jsx';
import CubeNet from '../components/CubeNet.jsx';
import SolutionView from '../components/SolutionView.jsx';
import useOpenCv from '../hooks/useOpenCv.js';
import { detectColors } from '../utils/cvProcessor.js';
import { createSolver } from '../utils/cubeSolver.js';

/**
 * SolverPage — Main scanning & solving orchestrator.
 *
 * Flow:
 *   1. User selects a face to scan (U → R → F → D → L → B)
 *   2. Points webcam at that face, clicks "Capture"
 *   3. cvProcessor samples 9 colors → stored in state
 *   4. Repeat for all 6 faces
 *   5. Click "Solve" → cubeSolver returns optimal move sequence
 *   6. SolutionView renders the moves
 */

const FACE_ORDER = ['U', 'R', 'F', 'D', 'L', 'B'];

const EMPTY_FACES = {
  U: null, R: null, F: null,
  D: null, L: null, B: null,
};

export default function SolverPage() {
  // ── State ──
  const [faces, setFaces] = useState({ ...EMPTY_FACES });
  const [currentFaceIdx, setCurrentFaceIdx] = useState(0);
  const [solution, setSolution] = useState(null);
  const [solveLoading, setSolveLoading] = useState(false);
  const [solveError, setSolveError] = useState(null);
  const [solverReady, setSolverReady] = useState(false);

  const { loaded: opencvReady } = useOpenCv();
  const solverRef = useRef(null);

  // ── Initialize the Web Worker solver on mount ──
  useEffect(() => {
    const solver = createSolver();
    solverRef.current = solver;

    solver.ready
      .then(() => setSolverReady(true))
      .catch((err) => console.error('Solver init error:', err));

    return () => solver.terminate();
  }, []);

  const currentFace = FACE_ORDER[currentFaceIdx];
  const allScanned = FACE_ORDER.every((f) => faces[f] !== null);

  // ── Capture handler — called from CubeScanner ──
  const handleCapture = useCallback(
    (videoEl, gridRect) => {
      try {
        const colors = detectColors(videoEl, gridRect);
        setFaces((prev) => ({ ...prev, [currentFace]: colors }));
        // Auto-advance to next unscanned face
        if (currentFaceIdx < FACE_ORDER.length - 1) {
          setCurrentFaceIdx((i) => i + 1);
        }
      } catch (err) {
        console.error('Color detection error:', err);
        setSolveError(`Detection failed: ${err.message}`);
      }
    },
    [currentFace, currentFaceIdx]
  );

  // ── Build the 54-char facelet string (URFDLB order) ──
  const buildFaceString = useCallback(() => {
    return FACE_ORDER.map((f) => faces[f].join('')).join('');
  }, [faces]);

  // ── Solve ──
  const handleSolve = useCallback(async () => {
    if (!allScanned || !solverRef.current) return;

    setSolveLoading(true);
    setSolveError(null);
    setSolution(null);

    try {
      const faceString = buildFaceString();
      const moves = await solverRef.current.solve(faceString);
      setSolution(moves);
    } catch (err) {
      setSolveError(err.message);
    } finally {
      setSolveLoading(false);
    }
  }, [allScanned, buildFaceString]);

  // ── Reset everything ──
  const handleReset = useCallback(() => {
    setFaces({ ...EMPTY_FACES });
    setCurrentFaceIdx(0);
    setSolution(null);
    setSolveError(null);
    setSolveLoading(false);
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Hero */}
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-[var(--color-accent-violet)] to-[var(--color-accent-cyan)] bg-clip-text text-transparent">
          Rubik's Cube Solver
        </h1>
        <p className="text-slate-400 mt-2 text-sm sm:text-base max-w-xl mx-auto">
          Point your webcam at each face of the cube, capture the colors, then let the Kociemba algorithm find the optimal solution.
        </p>
      </div>

      {/* Status badges */}
      <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
        <StatusBadge
          label="OpenCV"
          ready={opencvReady}
        />
        <StatusBadge
          label="Solver"
          ready={solverReady}
        />
        <span className="text-xs text-slate-500">
          {FACE_ORDER.filter((f) => faces[f] !== null).length}/6 faces scanned
        </span>
      </div>

      {/* Main layout — scanner + cube net */}
      <div className="flex flex-col lg:flex-row items-start justify-center gap-8">
        {/* Left: Scanner */}
        <div className="flex-1 w-full max-w-[680px]">
          <CubeScanner
            opencvReady={opencvReady}
            currentFace={currentFace}
            onCapture={handleCapture}
            capturedColors={faces[currentFace]}
            disabled={solveLoading}
          />
        </div>

        {/* Right: Cube Net + face selector + actions */}
        <div className="flex flex-col items-center gap-6 w-full lg:w-auto">
          <CubeNet faces={faces} currentFace={currentFace} />

          {/* Face selector buttons */}
          <div className="flex flex-wrap gap-2 justify-center">
            {FACE_ORDER.map((f, idx) => (
              <button
                key={f}
                id={`select-face-${f}`}
                onClick={() => setCurrentFaceIdx(idx)}
                className={`
                  px-3 py-1.5 text-xs font-semibold rounded-lg
                  transition-all duration-200 border
                  ${currentFaceIdx === idx
                    ? 'border-cyan-400 bg-cyan-400/10 text-cyan-300'
                    : faces[f]
                      ? 'border-green-500/30 bg-green-500/10 text-green-400'
                      : 'border-white/10 bg-white/5 text-slate-400 hover:bg-white/10'
                  }
                `}
              >
                {f} {faces[f] ? '✓' : ''}
              </button>
            ))}
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            <button
              id="solve-btn"
              className="btn-accent"
              onClick={handleSolve}
              disabled={!allScanned || !solverReady || solveLoading}
            >
              {solveLoading ? '⏳ Solving…' : '🧩 Solve Cube'}
            </button>
            <button
              id="reset-btn"
              className="px-4 py-2 text-sm font-medium rounded-lg border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all"
              onClick={handleReset}
            >
              ↺ Reset
            </button>
          </div>
        </div>
      </div>

      {/* Solution output */}
      {(solution !== null || solveLoading || solveError) && (
        <div className="mt-10 max-w-3xl mx-auto">
          <SolutionView
            solution={solution}
            loading={solveLoading}
            error={solveError}
          />
        </div>
      )}
    </div>
  );
}

/** Small status indicator badge */
function StatusBadge({ label, ready }) {
  return (
    <span
      className={`
        inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full
        ${ready
          ? 'bg-green-500/10 text-green-400 border border-green-500/20'
          : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
        }
      `}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          ready ? 'bg-green-400' : 'bg-yellow-400 animate-pulse'
        }`}
      />
      {label}: {ready ? 'Ready' : 'Loading…'}
    </span>
  );
}
