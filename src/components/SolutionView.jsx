/**
 * SolutionView — Displays the solver's move sequence as styled cards.
 *
 * Props:
 *   @param {string}  solution  — Space-separated move string (e.g. "R U R' U' F2").
 *   @param {boolean} loading   — Show loading state while solver runs.
 *   @param {string}  error     — Error message to display if solve fails.
 */

// Move color accents — group by face for visual clarity
const MOVE_ACCENT = {
  U: 'from-slate-200 to-slate-400',     // white-ish
  R: 'from-red-400 to-red-600',
  F: 'from-green-400 to-green-600',
  D: 'from-yellow-300 to-yellow-500',
  L: 'from-orange-400 to-orange-600',
  B: 'from-blue-400 to-blue-600',
};

function getMoveFace(move) {
  return move.charAt(0).toUpperCase();
}

export default function SolutionView({ solution, loading, error }) {
  if (error) {
    return (
      <div className="glass-card p-6 text-center">
        <p className="text-red-400 font-medium">❌ {error}</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="glass-card p-8 text-center">
        <div className="inline-block w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-[var(--color-text-secondary)] text-sm">Solving… computing optimal moves</p>
      </div>
    );
  }

  if (!solution) return null;

  // Handle already-solved cube
  const trimmed = solution.trim();
  if (trimmed === '') {
    return (
      <div className="glass-card p-6 text-center">
        <p className="text-2xl mb-2">🎉</p>
        <p className="text-green-400 font-semibold">Already solved!</p>
      </div>
    );
  }

  const moves = trimmed.split(/\s+/);

  return (
    <div className="glass-card p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-[var(--color-text-primary)]">Solution</h3>
        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-gradient-to-r from-[var(--color-accent-violet)] to-[var(--color-accent-cyan)] text-white">
          {moves.length} move{moves.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Move cards grid */}
      <div className="flex flex-wrap gap-2">
        {moves.map((move, idx) => {
          const face = getMoveFace(move);
          const gradient = MOVE_ACCENT[face] || 'from-slate-500 to-slate-700';

          return (
            <div
              key={idx}
              className="animate-card-enter"
              style={{ animationDelay: `${idx * 60}ms` }}
            >
              <div
                className={`
                  flex items-center justify-center
                  w-14 h-14 sm:w-16 sm:h-16
                  rounded-xl
                  bg-gradient-to-br ${gradient}
                  text-white font-bold text-lg sm:text-xl
                  shadow-lg
                  transition-transform duration-150
                  hover:scale-110 hover:shadow-xl
                  cursor-default select-none
                `}
                title={`Step ${idx + 1}: ${move}`}
              >
                {move}
              </div>
              <p className="text-[10px] text-center text-[var(--color-text-muted)] mt-1">
                {idx + 1}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
