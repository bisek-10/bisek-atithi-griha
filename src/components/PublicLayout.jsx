import { useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";

function DayStrip({ count = 12, className = "" }) {
  return (
    <div className={`day-strip ${className}`} aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <span key={i} style={{ height: 6 + (i % 4) * 3 }} />
      ))}
    </div>
  );
}

export default function PublicLayout() {
  const { pathname } = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const navLink = (to, label) => (
    <Link
      to={to}
      onClick={closeMenu}
      className={`text-sm tracking-wide transition-colors ${
        pathname === to
          ? "text-pine-700 font-semibold"
          : "text-ink-600 hover:text-pine-700"
      }`}>
      {label}
    </Link>
  );

  return (
    <div className="min-h-screen flex flex-col bg-sand-50">
      {/* ================= NAVBAR ================= */}
      <header className="border-b border-sand-200 bg-sand-50/95 backdrop-blur sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-5 md:px-6 h-24 flex items-center justify-between">
          {/* Logo + Brand */}
          <Link
            to="/"
            onClick={closeMenu}
            className="flex items-center gap-3 h-full group">
            <img
              src="/logo-cropped.svg"
              alt="Bisek Atithi Griha"
              className="h-20 w-20 object-contain shrink-0"
            />

            <span className="font-display text-xl text-ink-800 tracking-tight group-hover:text-pine-700 transition-colors">
              Bisek Atithi Griha
            </span>
          </Link>

          {/* ================= DESKTOP NAVIGATION ================= */}
          <nav className="hidden md:flex items-center gap-6">
            {navLink("/", "Home")}
            {navLink("/rooms", "Rooms")}
            {navLink("/facilities", "Facilities")}
            {navLink("/gallery", "Gallery")}
            {navLink("/contact", "Contact")}

            <Link
              to="/book"
              className="bg-pine-700 text-sand-50 px-5 py-2 rounded-full text-sm font-semibold hover:bg-pine-800 transition-all shadow-sm">
              Book Now
            </Link>
          </nav>

          {/* ================= MOBILE MENU BUTTON ================= */}
          <button
            type="button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden w-11 h-11 rounded-xl flex items-center justify-center text-ink-700 hover:bg-sand-100 transition-colors"
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMenuOpen}>
            {isMenuOpen ? (
              /* X icon */
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              /* Hamburger icon */
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            )}
          </button>
        </div>

        {/* ================= MOBILE NAVIGATION ================= */}
        <div
          className={`md:hidden border-t border-sand-200 bg-sand-50 overflow-hidden transition-all duration-300 ${
            isMenuOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
          }`}>
          <nav className="max-w-5xl mx-auto px-5 py-4 flex flex-col gap-1">
            <Link
              to="/"
              onClick={closeMenu}
              className={`px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                pathname === "/"
                  ? "bg-pine-700 text-sand-50"
                  : "text-ink-700 hover:bg-sand-100 hover:text-pine-700"
              }`}>
              Home
            </Link>

            <Link
              to="/rooms"
              onClick={closeMenu}
              className={`px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                pathname === "/rooms"
                  ? "bg-pine-700 text-sand-50"
                  : "text-ink-700 hover:bg-sand-100 hover:text-pine-700"
              }`}>
              Rooms
            </Link>

            <Link
              to="/facilities"
              onClick={closeMenu}
              className={`px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                pathname === "/facilities"
                  ? "bg-pine-700 text-sand-50"
                  : "text-ink-700 hover:bg-sand-100 hover:text-pine-700"
              }`}>
              Facilities
            </Link>

            <Link
              to="/gallery"
              onClick={closeMenu}
              className={`px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                pathname === "/gallery"
                  ? "bg-pine-700 text-sand-50"
                  : "text-ink-700 hover:bg-sand-100 hover:text-pine-700"
              }`}>
              Gallery
            </Link>

            <Link
              to="/contact"
              onClick={closeMenu}
              className={`px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                pathname === "/contact"
                  ? "bg-pine-700 text-sand-50"
                  : "text-ink-700 hover:bg-sand-100 hover:text-pine-700"
              }`}>
              Contact
            </Link>

            {/* Mobile Book Now */}
            <Link
              to="/book"
              onClick={closeMenu}
              className="mt-2 bg-pine-700 text-sand-50 px-4 py-3 rounded-xl text-sm font-semibold text-center hover:bg-pine-800 transition-colors">
              Book Now
            </Link>
          </nav>
        </div>
      </header>

      {/* ================= PAGE CONTENT ================= */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* ================= FOOTER ================= */}
      <footer className="border-t border-sand-200 mt-16 bg-white">
        <div className="max-w-5xl mx-auto px-6 py-12 flex flex-col md:flex-row md:items-center md:justify-between gap-8 text-sm text-ink-600">
          {/* Footer information */}
          <div className="space-y-4">
            <div>
              <p className="font-display text-lg text-ink-800 mb-1">
                Bisek Atithi Griha
              </p>

              <p className="max-w-xs leading-relaxed">
                Cancer Gate No. 1, Bharatpur-7, Chitwan, Nepal. Providing a
                restful home for patients and families.
              </p>
            </div>

            {/* Footer Links */}
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs uppercase tracking-wider font-semibold">
              <Link
                to="/privacy"
                className="hover:text-pine-700 transition-colors">
                Privacy Policy
              </Link>

              <Link
                to="/contact"
                className="hover:text-pine-700 transition-colors">
                Contact
              </Link>

              <Link
                to="/admin/login"
                className="hover:text-pine-700 transition-colors">
                Staff Login
              </Link>
            </div>
          </div>

          {/* Footer decoration + copyright */}
          <div className="flex flex-col items-end gap-3">
            <DayStrip count={16} className="text-pine-700 opacity-60" />

            <p className="text-[11px] text-ink-400">
              © 2026 Bisek Atithi Griha. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
