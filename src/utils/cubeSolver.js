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

  worker.addEventListener('message', (e) => {
    const { type, moves, message } = e.data;

    switch (type) {
      case 'ready':
        readyResolve();
        break;
      case 'solution':
        if (solveResolve) {
          solveResolve(moves);
          solveResolve = null;
          solveReject = null;
        }
        break;
      case 'error':
        // If we haven't resolved 'ready' yet, this is an init error
        if (readyResolve) {
          readyReject(new Error(message));
          readyResolve = null;
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
        worker.postMessage({ type: 'solve', faceString });
      });
    },

    /** Terminate the worker and free resources. */
    terminate() {
      worker.terminate();
    },
  };
}
