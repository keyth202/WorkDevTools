import React, { useEffect, useState } from "react";
import { Menu, X, Home, Folder, Settings, HelpCircle } from "lucide-react";
import { Link } from 'react-router-dom'

// ---- Types ----
export type NavItem = {
  label: string;
  href: string;
  icon?: React.ReactNode;
};

export type ResponsiveSidebarProps = {
  title?: string;
  nav: NavItem[];
  initialOpen?: boolean;
  /** Optionally pass the current path to highlight an item. Defaults to location.pathname (when available). */
  currentPath?: string;
  children?: React.ReactNode;
};

// ---- Component ----
export default function ResponsiveSidebarLayout({
  title = "My App",
  nav,
  initialOpen = false,
  currentPath,
  children,
}: ResponsiveSidebarProps) {
  const [open, setOpen] = useState(initialOpen);
  const [active, setActive] = useState<string>(currentPath || (typeof window !== "undefined" ? window.location.pathname : "/"));

  useEffect(() => {
    if (currentPath) setActive(currentPath);
  }, [currentPath]);

  useEffect(() => {
    // Close on ESC
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  function NavLink({ item }: { item: NavItem }) {
    const isActive = active === item.href;
    return (
        <Link to={item.href}
            onClick={() => setActive(item.href)}
            className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors
            ${isActive
                ? "bg-slate-800/80 text-white"
                : "text-slate-300 hover:bg-slate-800/60 hover:text-white"}
            `}
        >
            <span className="shrink-0">{item.icon}</span>
            <span className="truncate">{item.label}</span>
      </Link>
    );
  }

  // Sidebar content used in both mobile drawer and desktop sidebar
  const Sidebar = (
    <div className="flex max-h-[80vh] w-72 flex-col bg-slate-900 text-slate-200 z-50">

      <nav className="p-3 space-y-1 overflow-y-auto">
        {nav.map((item) => (
          <NavLink key={item.href} item={item} />
        ))}
      </nav>
      <div className="mt-auto p-3 text-xs text-slate-400">© {new Date().getFullYear()} • {title}</div>
    </div>
  );

  return (
    <div className=" bg-slate-950 text-slate-100">
      {/* Top bar (mobile) */}
      <div className="sticky top-0 z-40 flex items-center justify-between border-b border-slate-800 bg-slate-900/80 backdrop-blur px-3 py-2">
        <button
          aria-label={open ? "Close navigation" : "Open navigation"}
          aria-controls="sidebar-drawer"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-700/60 bg-slate-800 px-3 py-2 text-slate-200 active:scale-95"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          <span className="text-sm">Menu</span>
        </button>
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-lg bg-gradient-to-br from-cyan-400 to-violet-400" />
          <span className="font-semibold">{title}</span>
        </div>
      </div>
          {/*<aside className="hidden md:block sticky top-0 h-screen border-r border-slate-800">
            {Sidebar}
          </aside>*/}
          {open && (
            <>
              {/* Click-away scrim */}
              <div
                className="fixed inset-0 z-40 bg-black/0"
                onClick={() => setOpen(false)}
              />
              {/* Popover panel (doesn't push content) */}
              <div
                className="fixed z-50 top-14 left-3"
                role="dialog"
                aria-modal="true"
              >
                {Sidebar}
              </div>
            </>
          )}


      {/* Mobile drawer + scrim */}
      <div
        id="sidebar-drawer"
        className={`md:hidden fixed inset-0 z-50 ${open ? "pointer-events-auto" : "pointer-events-none"}`}
        aria-hidden={!open}
      >
        {/* Scrim */}
        <div
          className={`absolute inset-0 bg-black/50 transition-opacity ${open ? "opacity-100" : "opacity-0"}`}
          onClick={() => setOpen(false)}
        />
        {/* Drawer */}
        <div
          className={`absolute left-0 top-0 h-full w-72 transform bg-slate-900 shadow-2xl transition-transform
            ${open ? "translate-x-0" : "-translate-x-full"}`}
          role="dialog"
          aria-modal="true"
        >
          {Sidebar}
        </div>
      </div>
    </div>
  );
}