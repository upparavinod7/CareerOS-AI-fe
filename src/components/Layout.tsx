import { useMemo, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  BriefcaseBusiness,
  ClipboardList,
  Home,
  LineChart,
  Map,
  Menu,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";

const links = [
  { to: "/dashboard", label: "Dashboard", icon: Home },
  { to: "/jobs", label: "Jobs", icon: BriefcaseBusiness },
  { to: "/fit", label: "Skill Analyzer", icon: Sparkles },
  { to: "/roadmap", label: "Roadmap", icon: Map },
  { to: "/applications", label: "Applications", icon: ClipboardList },
];

const transition = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};

function Sidebar({ close }: { close?: () => void }) {
  return (
    <aside className="glass soft-scroll h-full overflow-auto rounded-2xl p-4">
      <div className="mb-6 flex items-center gap-2">
        <div className="rounded-xl bg-teal-400/15 p-2 text-teal-300">
          <LineChart size={18} />
        </div>
        <div>
          <p className="text-sm font-semibold text-white">CareerOS AI</p>
          <p className="text-xs text-slate-400">Talent Intelligence</p>
        </div>
      </div>

      <nav className="space-y-1.5">
        {links.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={close}
              className={({ isActive }) =>
                `group flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition ${
                  isActive
                    ? "bg-teal-400/15 text-teal-200"
                    : "text-slate-300 hover:bg-white/5 hover:text-white"
                }`
              }
            >
              <Icon size={16} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [query, setQuery] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);

  const initials = useMemo(() => {
    const text = user?.name?.trim() || "U";
    return text
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() || "")
      .join("");
  }, [user?.name]);

  return (
    <div className="min-h-screen text-slate-100">
      <div className="mx-auto grid min-h-screen max-w-[1440px] grid-cols-1 gap-4 p-3 md:grid-cols-[260px_1fr] md:p-4">
        <div className="hidden md:block">
          <Sidebar />
        </div>

        <div className="space-y-4">
          <header className="glass sticky top-3 z-40 rounded-2xl px-4 py-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setMobileOpen(true)}
                className="rounded-lg border border-white/15 p-2 text-slate-300 md:hidden"
              >
                <Menu size={18} />
              </button>

              <div className="flex flex-1 items-center gap-2 rounded-xl border border-white/10 bg-black/20 px-3 py-2">
                <Search size={16} className="text-slate-400" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      navigate(`/jobs?q=${encodeURIComponent(query)}`);
                    }
                  }}
                  placeholder="Search jobs, roles, companies..."
                  className="w-full bg-transparent text-sm outline-none placeholder:text-slate-500"
                />
              </div>

              <div className="hidden items-center gap-2 rounded-xl border border-white/10 bg-black/25 px-3 py-2 sm:flex">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-500/20 text-xs font-semibold text-teal-200">
                  {initials}
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-200">{user?.name}</p>
                  <button onClick={logout} className="text-[11px] text-slate-400 hover:text-white">
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </header>

          <AnimatePresence mode="wait">
            <motion.main
              key={location.pathname}
              initial={transition.initial}
              animate={transition.animate}
              exit={transition.exit}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              <Outlet />
            </motion.main>
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 p-3 md:hidden"
          >
            <motion.div
              initial={{ x: -24, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -24, opacity: 0 }}
              className="relative h-full max-w-[290px]"
            >
              <button
                onClick={() => setMobileOpen(false)}
                className="absolute right-3 top-3 z-10 rounded-lg border border-white/15 bg-[#070d1a]/80 p-2 text-slate-300"
              >
                <X size={16} />
              </button>
              <Sidebar close={() => setMobileOpen(false)} />
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
