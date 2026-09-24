/**
 * BlogsPage — Clean, readable blog layout with full article.
 *
 * Uses Tailwind Typography (prose) for article content styling.
 * Contains one hardcoded blog post about Kociemba's algorithm.
 */

export default function BlogsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      {/* Page header */}
      <div className="mb-12">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--color-text-primary)] mb-2">
          Blog
        </h1>
        <p className="text-[var(--color-text-secondary)] text-sm">
          Deep dives into the mathematics and algorithms behind puzzle solving.
        </p>
      </div>

      {/* Blog Post Card */}
      <article className="glass-card p-6 sm:p-10">
        {/* Meta */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-gradient-to-r from-[var(--color-accent-violet)] to-[var(--color-accent-cyan)] text-white">
            Algorithm
          </span>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[var(--color-surface-800)] text-[var(--color-text-secondary)] border border-[var(--color-surface-600)]/30">
            Group Theory
          </span>
          <span className="text-xs text-[var(--color-text-muted)] ml-auto">
            September 2026 · 8 min read
          </span>
        </div>

        {/* Title */}
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--color-text-primary)] leading-tight mb-2">
          Demystifying God's Number: Solving the Rubik's Cube with Graph Theory
        </h2>
        <p className="text-[var(--color-text-secondary)] text-sm mb-8">
          By <span className="text-cyan-600 font-medium">CubeCV Engineering</span>
        </p>

        {/* Article content — using Tailwind prose for typography */}
        <div className="prose prose-lg max-w-none prose-headings:text-[var(--color-text-primary)] prose-p:text-[var(--color-text-secondary)] prose-strong:text-[var(--color-text-primary)] prose-a:text-cyan-600">
          <p>
            The Rubik's Cube is far more than a colorful toy on a desk — it is a compact physical
            manifestation of abstract algebra. Every twist of a face is a <strong>group operation</strong>,
            and the cube's state space forms one of the most elegant examples of a <strong>finite group</strong>
            in mathematics. The group of the Rubik's Cube contains exactly
            43,252,003,274,489,856,000 — roughly <strong>43 quintillion</strong> — distinct states. Each
            state can be reached from any other through a sequence of the 18 possible moves (6 faces × 3
            rotations: clockwise, counter-clockwise, and half-turn). What makes this group remarkable is
            not its size, but that its underlying structure provides a mathematical guarantee: every single
            one of those 43 quintillion configurations can be solved in <strong>20 moves or fewer</strong>.
            This magic number — 20 — is known as <em>God's Number</em>, proven in 2010 by Morley Davidson,
            John Dethridge, Herbert Kociemba, and Tomas Rokicki through a massive distributed computation
            underwritten by Google.
          </p>

          <p>
            To understand why 20 moves suffice, we can visualize the cube's state space as a
            <strong> Cayley Graph</strong>. A Cayley Graph is a directed graph where each node represents a
            unique state of the cube, and each edge represents a single move. The solved state sits at the
            center, and every other node is connected by the shortest path — measured in moves — back to
            that center. God's Number tells us that no node in this enormous graph is more than 20 edges
            away from the solved state. It's the <em>diameter</em> of the graph. In graph-theoretic terms,
            the Rubik's Cube group is remarkably "compact" despite its astronomical cardinality. A naive
            breadth-first search through this graph is obviously impractical — 43 quintillion nodes cannot
            fit in any computer's memory. This is where the genius of algorithmic design enters.
          </p>

          <p>
            Herbert Kociemba's <strong>Two-Phase Algorithm</strong>, published in 1992, is the breakthrough
            that makes near-optimal solving tractable. The key insight is decomposing the problem through
            <strong>nested subgroups</strong>. The full Rubik's Cube group <em>G₀</em> contains a subgroup
            <em>G₁</em> that restricts the cube to states reachable only by half-turns of the U, D, R, and
            L faces plus any turn of the F and B faces. <em>G₁</em> is vastly smaller — only about 20
            billion states — yet any cube state can be reduced to a <em>G₁</em> state in roughly 12 moves.
            Phase 1 of Kociemba's algorithm does exactly this: it searches for a sequence of moves that
            brings any scrambled cube into this restricted subgroup. Phase 2 then searches within <em>G₁</em>
            for the shortest path to the solved state, which is much faster because the search space has been
            reduced by a factor of two billion. The combined solution rarely exceeds 20 moves.
          </p>

          <p>
            Both phases leverage <strong>Pattern Databases</strong> — large precomputed lookup tables that
            store the exact distance-to-goal for simplified abstractions of the cube state. Instead of
            encoding the full cube position (which would require impossibly large tables), the algorithm
            encodes only specific aspects — such as the orientation of all corners, or the positions of a
            subset of edges. These partial distances serve as <em>admissible heuristics</em> for an IDA*
            (Iterative Deepening A*) search, guaranteeing that the search never overestimates the true
            distance and therefore always finds an optimal or near-optimal path. The pruning tables for
            Kociemba's algorithm are roughly 20 MB in size and take a few seconds to generate at runtime,
            but once built, any cube state can be solved in under a millisecond. This is the engine running
            in your browser right now when you click "Solve" on this very page.
          </p>

          <p>
            What makes this approach philosophically beautiful is how it mirrors a broader principle in
            computer science: <strong>hierarchical decomposition</strong>. Rather than confronting the full
            complexity of a 43-quintillion-node graph head-on, we recognize its algebraic structure, identify
            a meaningful "halfway house" (the subgroup <em>G₁</em>), and split an intractable search into
            two very tractable ones. God's Number — the guarantee that 20 moves always suffice — is not a
            product of brute force, but of <em>mathematical insight</em> into the symmetry group of the
            cube. It's a reminder that the most powerful optimizations don't come from faster hardware, but
            from deeper understanding of the problem's structure. The next time you scramble a Rubik's Cube
            and hand it to this solver, know that behind the scenes, you're watching decades of combinatorial
            group theory, graph search algorithms, and clever engineering converge in a fraction of a second.
          </p>
        </div>
      </article>
    </div>
  );
}
