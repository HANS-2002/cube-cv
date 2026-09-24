import { NavLink } from 'react-router-dom';
import { useState } from 'react';

/**
 * Navbar — Fixed top navigation with glassmorphism effect.
 * Links: Cube Solver (/), Blogs (/blogs).
 * Responsive: hamburger menu on mobile.
 */
export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const linkClass = ({ isActive }) =>
    `relative px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
      isActive
        ? 'text-[var(--color-text-primary)] bg-[var(--color-surface-700)]'
        : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-800)]'
    }`;

  return (
    <nav className="glass fixed top-0 inset-x-0 z-50 h-16 flex items-center px-6">
      {/* Logo / Brand */}
      <NavLink to="/" className="flex items-center gap-2 mr-auto">
        <img
          src="/rubiks.png"
          alt="CubeCV Logo"
          className="w-8 h-8 rounded-lg object-contain"
        />
        <span className="text-lg font-bold tracking-tight text-[var(--color-text-primary)] hidden sm:inline">
          CubeCV
        </span>
      </NavLink>

      {/* Desktop Links */}
      <div className="hidden md:flex items-center gap-2">
        <NavLink to="/" end className={linkClass}>
          Cube Solver
        </NavLink>
        <NavLink to="/blogs" className={linkClass}>
          Blogs
        </NavLink>
      </div>

      {/* Mobile Hamburger */}
      <button
        id="mobile-menu-toggle"
        className="md:hidden text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] p-2"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Toggle menu"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          {mobileOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* Mobile Dropdown */}
      {mobileOpen && (
        <div className="glass absolute top-16 inset-x-0 md:hidden flex flex-col gap-1 p-4">
          <NavLink to="/" end className={linkClass} onClick={() => setMobileOpen(false)}>
            Cube Solver
          </NavLink>
          <NavLink to="/blogs" className={linkClass} onClick={() => setMobileOpen(false)}>
            Blogs
          </NavLink>
        </div>
      )}
    </nav>
  );
}
