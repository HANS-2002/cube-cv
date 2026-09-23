/**
 * solverWorker.js — Web Worker for cubejs solver.
 *
 * Runs Cube.initSolver() on creation (builds pruning tables, ~2-5s),
 * then listens for messages containing a 54-char facelet string and
 * responds with the solution move sequence.
 *
 * Messages IN:  { type: 'solve', faceString: '...' }
 * Messages OUT: { type: 'ready' }
 *             | { type: 'solution', moves: '...' }
 *             | { type: 'error', message: '...' }
 */
import Cube from 'cubejs';

// Initialize the solver's pruning tables immediately on worker start
try {
  Cube.initSolver();
  self.postMessage({ type: 'ready' });
} catch (err) {
  self.postMessage({ type: 'error', message: `Init failed: ${err.message}` });
}

// Listen for solve requests
self.addEventListener('message', (e) => {
  const { type, faceString } = e.data;

  if (type === 'solve') {
    try {
      const cube = Cube.fromString(faceString);
      const solution = cube.solve();
      self.postMessage({ type: 'solution', moves: solution });
    } catch (err) {
      self.postMessage({ type: 'error', message: `Solve failed: ${err.message}` });
    }
  }
});
