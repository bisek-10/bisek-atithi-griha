import { useState, useEffect } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const links = [
  {
    to: "/admin",
    label: "Overview",
    end: true,
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
        />
      </svg>
    ),
  },
  {
    to: "/admin/dashboard",
    label: "Sales",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
        />
      </svg>
    ),
  },
  {
    to: "/admin/customers",
    label: "Customers",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
        />
      </svg>
    ),
  },
  {
    to: "/admin/settings",
    label: "Settings",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-.826 2.37a1.724 1.724 0 002.37c.996.608 2.296.07 2.572-1.065z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
        />
      </svg>
    ),
  },
];

export default function AdminLayout() {
  const { signOut } = useAuth();
  const location = useLocation();

  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem("admin_sidebar_collapsed");
    return saved === "true";
  });

  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem("admin_sidebar_collapsed", isCollapsed);
  }, [isCollapsed]);

  useEffect(() => {
    setIsMobileOpen(false);
  }, [location]);

  const sidebarClasses = `
    fixed inset-y-0 left-0 z-40
    bg-ink-800 text-sand-100
    transition-all duration-300 ease-in-out transform
    lg:translate-x-0 lg:static lg:block
    ${isCollapsed ? "lg:w-20" : "lg:w-64"}
    ${isMobileOpen ? "translate-x-0 w-64" : "-translate-x-full lg:translate-x-0"}
  `;

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-sand-100 font-body">
      {/* Mobile Header */}
      <header className="lg:hidden bg-ink-800 text-sand-50 p-4 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileOpen(true)}
            className="p-1 hover:bg-ink-700 rounded-md"
            aria-label="Open menu">
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
          </button>

          <span className="font-display text-lg tracking-tight">
            Bisek Atithi
          </span>
        </div>

        <p className="text-xs text-sand-100/60 font-medium">Management</p>
      </header>

      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={sidebarClasses}>
        <div
          className={`p-6 flex items-center justify-between ${
            isCollapsed ? "lg:flex-col lg:gap-4" : ""
          }`}>
          <div className={isCollapsed ? "lg:hidden" : "block"}>
            <p className="font-display text-xl text-sand-50 leading-tight">
              Bisek Atithi Griha
            </p>

            <p className="text-[10px] uppercase tracking-widest text-sand-100/40 mt-1 font-semibold">
              Management
            </p>
          </div>

          {isCollapsed && (
            <div className="hidden lg:flex flex-col items-center gap-1">
              <div className="w-8 h-8 rounded-lg bg-pine-700 flex items-center justify-center font-display text-sand-50">
                B
              </div>
            </div>
          )}

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex items-center justify-center w-8 h-8 rounded-full bg-ink-700 text-sand-100/50 hover:text-sand-50 transition-colors"
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}>
            <svg
              className={`w-4 h-4 transition-transform duration-300 ${
                isCollapsed ? "rotate-180" : ""
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
              />
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className="mt-4 px-3 space-y-1">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              title={isCollapsed ? link.label : ""}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                  isActive
                    ? "bg-pine-700 text-sand-50 shadow-lg shadow-pine-900/20"
                    : "text-sand-100/60 hover:bg-ink-700 hover:text-sand-50"
                } ${isCollapsed ? "lg:justify-center lg:px-0" : ""}`
              }>
              {/* Fixed: isActive is no longer referenced outside its scope */}
              <span className="shrink-0">{link.icon}</span>

              <span className={isCollapsed ? "lg:hidden" : "block"}>
                {link.label}
              </span>
            </NavLink>
          ))}
        </nav>

        {/* Sign Out */}
        <div className="absolute bottom-4 left-0 right-0 px-3">
          <button
            onClick={() => signOut()}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-brick-500 hover:bg-brick-500/10 transition-all ${
              isCollapsed ? "lg:justify-center lg:px-0" : ""
            }`}
            title={isCollapsed ? "Sign out" : ""}>
            <svg
              className="w-5 h-5 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>

            <span className={isCollapsed ? "lg:hidden" : "block"}>
              Sign out
            </span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 flex flex-col h-screen overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
