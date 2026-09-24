import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import SolverPage from './pages/SolverPage.jsx';
import BlogsPage from './pages/BlogsPage.jsx';

/**
 * App — Root component with routing configuration.
 * Renders the Navbar globally and switches between
 * the Solver and Blogs pages via React Router v6+.
 */
export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      {/* Main content area — offset by navbar height */}
      <main className="flex-1 pt-20">
        <Routes>
          <Route path="/" element={<SolverPage />} />
          <Route path="/blogs" element={<BlogsPage />} />
        </Routes>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-sm font-medium text-[var(--color-text-secondary)] border-t border-[var(--color-surface-600)]/30">
        Made with ❤️ by Hans
      </footer>
    </div>
  );
}
