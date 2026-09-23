/**
 * CubeNet — 2D unfolded cube net in cross layout.
 *
 * Displays all 54 facelets arranged as:
 *
 *         [ U ]
 *    [ L ][ F ][ R ][ B ]
 *         [ D ]
 *
 * Props:
 *   @param {Object} faces — { U: string[], R: string[], F: string[], D: string[], L: string[], B: string[] }
 *     Each value is an array of 9 color characters (U/R/F/D/L/B) or null if not yet scanned.
 *   @param {string} currentFace — The face currently being scanned (highlighted).
 */

// Color char → CSS background
const COLOR_BG = {
  U: 'var(--color-cube-white)',
  R: 'var(--color-cube-red)',
  F: 'var(--color-cube-green)',
  D: 'var(--color-cube-yellow)',
  L: 'var(--color-cube-orange)',
  B: 'var(--color-cube-blue)',
};

/** Renders a single 3×3 face grid */
function FaceMini({ faceKey, colors, isActive }) {
  const cells = colors || Array(9).fill(null);
  return (
    <div
      className={`grid grid-cols-3 gap-[2px] p-[2px] rounded-md transition-all duration-200 ${
        isActive ? 'ring-2 ring-cyan-400 ring-offset-1 ring-offset-[var(--color-surface-900)]' : ''
      }`}
    >
      {cells.map((c, i) => (
        <div
          key={i}
          className="w-5 h-5 sm:w-6 sm:h-6 rounded-sm transition-colors duration-300"
          style={{
            backgroundColor: c ? COLOR_BG[c] : 'var(--color-cube-unknown)',
          }}
        />
      ))}
    </div>
  );
}

export default function CubeNet({ faces, currentFace }) {
  return (
    <div className="glass-card p-4 sm:p-6 inline-block">
      <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
        Cube State
      </h3>

      {/* Cross layout using CSS grid */}
      <div className="grid grid-cols-4 gap-1 justify-items-center w-fit">
        {/* Row 1: empty + U + empty + empty */}
        <div />
        <FaceMini faceKey="U" colors={faces.U} isActive={currentFace === 'U'} />
        <div />
        <div />

        {/* Row 2: L + F + R + B */}
        <FaceMini faceKey="L" colors={faces.L} isActive={currentFace === 'L'} />
        <FaceMini faceKey="F" colors={faces.F} isActive={currentFace === 'F'} />
        <FaceMini faceKey="R" colors={faces.R} isActive={currentFace === 'R'} />
        <FaceMini faceKey="B" colors={faces.B} isActive={currentFace === 'B'} />

        {/* Row 3: empty + D + empty + empty */}
        <div />
        <FaceMini faceKey="D" colors={faces.D} isActive={currentFace === 'D'} />
        <div />
        <div />
      </div>
    </div>
  );
}
