/**
 * cubeSolver.js — Promise-based wrapper around the cubejs Web Worker.
 *
 * Usage:
 *   import { createSolver } from './cubeSolver';
 *   const solver = createSolver();
 *   await solver.ready;            // wait for pruning tables
 *   const moves = await solver.solve('UUUUUUUUURRRRRRRRRFFFFFFFFFDDDDDDDDDLLLLLLLLLBBBBBBBBB');
 *   solver.terminate();            // clean up the worker
 */

/** Solve timeout in milliseconds — prevent infinite loops on edge cases */
const SOLVE_TIMEOUT_MS = 15000;

/**
 * Creates and manages a Web Worker running the Kociemba solver.
 *
 * @returns {{
 *   ready: Promise<void>,
 *   solve: (faceString: string) => Promise<string>,
 *   terminate: () => void
 * }}
 */
export function createSolver() {
  const worker = new Worker(
    new URL('../workers/solverWorker.js', import.meta.url),
    { type: 'module' }
  );

  // ── Ready promise — resolves once initSolver() completes ──
  let readyResolve, readyReject;
  const ready = new Promise((res, rej) => {
    readyResolve = res;
    readyReject = rej;
  });

  // ── Solve promise — created per request ──
  let solveResolve = null;
  let solveReject = null;
  let solveTimer = null;

  worker.addEventListener('message', (e) => {
    const { type, moves, message } = e.data;

    switch (type) {
      case 'ready':
        readyResolve();
        readyResolve = null;
        break;
      case 'solution':
        if (solveTimer) clearTimeout(solveTimer);
        if (solveResolve) {
          solveResolve(moves);
          solveResolve = null;
          solveReject = null;
        }
        break;
      case 'error':
        if (solveTimer) clearTimeout(solveTimer);
        // If we haven't resolved 'ready' yet, this is an init error
        if (readyReject) {
          readyReject(new Error(message));
          readyResolve = null;
          readyReject = null;
        }
        if (solveReject) {
          solveReject(new Error(message));
          solveResolve = null;
          solveReject = null;
        }
        break;
    }
  });

  worker.addEventListener('error', (err) => {
    const error = new Error(err.message || 'Worker error');
    if (solveTimer) clearTimeout(solveTimer);
    if (readyReject) readyReject(error);
    if (solveReject) solveReject(error);
  });

  return {
    ready,

    /**
     * Solve a cube state.
     * @param {string} faceString  54-character URFDLB facelet string.
     * @returns {Promise<string>}  Solution move sequence (e.g. "R U R' U'").
     */
    solve(faceString) {
      return new Promise((res, rej) => {
        solveResolve = res;
        solveReject = rej;

        // Safety timeout — if solve takes more than 15s, it's likely stuck
        solveTimer = setTimeout(() => {
          if (solveReject) {
            solveReject(
              new Error(
                'Solve timed out after 15 seconds. The scanned cube state is likely invalid — try recapturing all faces.'
              )
            );
            solveResolve = null;
            solveReject = null;
          }
        }, SOLVE_TIMEOUT_MS);

        worker.postMessage({ type: 'solve', faceString });
      });
    },

    /** Terminate the worker and free resources. */
    terminate() {
      if (solveTimer) clearTimeout(solveTimer);
      worker.terminate();
    },
  };
}
