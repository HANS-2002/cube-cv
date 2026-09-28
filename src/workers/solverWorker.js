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

/**
 * Validate a 54-character facelet string.
 * Must be exactly 54 chars, using only U/R/F/D/L/B,
 * with exactly 9 of each character.
 */
function validateFaceString(str) {
  if (typeof str !== 'string' || str.length !== 54) {
    return 'Facelet string must be exactly 54 characters.';
  }

  const counts = { U: 0, R: 0, F: 0, D: 0, L: 0, B: 0 };
  for (const ch of str) {
    if (!(ch in counts)) {
      return `Invalid character '${ch}' in facelet string.`;
    }
    counts[ch]++;
  }

  for (const [face, count] of Object.entries(counts)) {
    if (count !== 9) {
      return `Face ${face} has ${count} facelets (expected 9). Color detection may be inaccurate — try recapturing.`;
    }
  }

  // Center facelets must each be unique (positions 4, 13, 22, 31, 40, 49)
  const centers = [str[4], str[13], str[22], str[31], str[40], str[49]];
  const uniqueCenters = new Set(centers);
  if (uniqueCenters.size !== 6) {
    return 'Center facelets are not unique — each face center must be a different color.';
  }

  return null; // valid
}

// Listen for solve requests
self.addEventListener('message', (e) => {
  const { type, faceString } = e.data;

  if (type === 'solve') {
    // Validate before attempting to solve
    const validationError = validateFaceString(faceString);
    if (validationError) {
      self.postMessage({ type: 'error', message: validationError });
      return;
    }

    try {
      const cube = Cube.fromString(faceString);
      const solution = cube.solve();
      self.postMessage({ type: 'solution', moves: solution });
    } catch (err) {
      self.postMessage({
        type: 'error',
        message: `Solve failed: ${err.message}. The scanned colors may be incorrect — try recapturing faces.`,
      });
    }
  }
});
