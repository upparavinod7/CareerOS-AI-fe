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
  Sparkles,
  Search,
  X,
  LogOut,
  User,
  PenLine
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";

const links = [
  { to: "/dashboard", label: "Dashboard", icon: Home },
  { to: "/jobs", label: "Job Postings", icon: BriefcaseBusiness },
  { to: "/fit", label: "Skill Analyzer", icon: Sparkles },
  { to: "/roadmap", label: "Learning Roadmaps", icon: Map },
  { to: "/cover-letter", label: "Cover Letters", icon: PenLine },
  { to: "/applications", label: "Tracker Pipeline", icon: ClipboardList },
];

const transition = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};

function Sidebar({ close }: { close?: () => void }) {
  const { user } = useAuth();
  
  return (
    <aside className="flex h-full flex-col bg-white/50 dark:bg-zinc-950/50 backdrop-blur-xl border-r border-slate-200/50 dark:border-white/10 w-[260px] relative z-20">
      <div className="flex h-16 items-center border-b border-slate-200/50 dark:border-white/10 px-6">
        <div className="flex items-center gap-2.5 text-brand-600 dark:text-brand-500">
          <LineChart size={24} strokeWidth={2.5} />
          <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">CareerOS</span>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-4 py-6 overflow-y-auto soft-scroll">
        <div className="mb-4 px-2">
          <p className="text-xs font-semibold tracking-wider text-slate-500 uppercase">Core Platform</p>
        </div>
        {links.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={close}
              className={({ isActive }) =>
                `group flex items-center gap-3 rounded-md px-2.5 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-400"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-slate-200"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={18} className={isActive ? "text-brand-600 dark:text-brand-400" : "text-slate-400 group-hover:text-slate-500 dark:text-slate-500 dark:group-hover:text-slate-400"} />
                  {item.label}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>
      
      <div className="border-t border-slate-200/50 dark:border-white/10 p-4">
        <div className="flex items-center gap-3 rounded-xl border border-slate-200/50 dark:border-white/10 bg-white/40 dark:bg-zinc-800/40 p-3 shadow-sm">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-brand text-sm font-bold text-white shadow-inner">
             {user?.name?.[0]?.toUpperCase() || "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="truncate text-sm font-medium text-slate-900 dark:text-slate-200">{user?.name}</p>
            <p className="truncate text-xs text-slate-500 dark:text-slate-400">{user?.email}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default function Layout() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [query, setQuery] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen text-slate-900 dark:text-slate-50">
      {/* Desktop Sidebar */}
      <div className="hidden md:fixed md:inset-y-0 md:flex md:w-[260px] md:flex-col">
        <Sidebar />
      </div>

      <div className="flex flex-1 flex-col md:pl-[260px]">
        {/* Top Header */}
        <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between gap-x-4 border-b border-slate-200/50 dark:border-white/10 bg-white/50 dark:bg-zinc-950/50 backdrop-blur-xl px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <button
              onClick={() => setMobileOpen(true)}
              className="-m-2.5 p-2.5 text-slate-500 hover:text-slate-600 dark:text-slate-400 dark:hover:text-slate-300 md:hidden"
            >
              <Menu size={24} />
            </button>
            
            <form className="relative flex flex-1" action="#" method="GET" onSubmit={(e) => { e.preventDefault(); navigate(`/jobs?q=${encodeURIComponent(query)}`); }}>
              <label htmlFor="search-field" className="sr-only">Search</label>
              <Search className="pointer-events-none absolute inset-y-0 left-0 h-full w-5 text-slate-400" aria-hidden="true" />
              <input
                id="search-field"
                className="block h-full w-full border-0 py-0 pl-8 pr-0 text-slate-900 dark:text-white placeholder:text-slate-400 bg-transparent focus:ring-0 sm:text-sm"
                placeholder="Search jobs, roles, companies..."
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </form>

            <div className="flex items-center gap-x-4 lg:gap-x-6">
              <button 
                onClick={() => navigate('/profile')}
                className="-m-2.5 p-2.5 text-slate-400 hover:text-slate-500 dark:hover:text-slate-300"
              >
                <User size={20} />
              </button>
              <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-slate-200 dark:lg:bg-slate-800" aria-hidden="true" />
              <button 
                onClick={logout}
                className="-m-2.5 p-2.5 text-slate-400 hover:text-slate-500 dark:hover:text-slate-300"
                title="Log out"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 py-8">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={transition.initial}
                animate={transition.animate}
                exit={transition.exit}
                transition={{ duration: 0.2 }}
                className="w-full"
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>

      {/* Mobile Sidebar overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm md:hidden"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              className="fixed inset-y-0 left-0 z-50 w-full max-w-xs md:hidden"
            >
              <button
                onClick={() => setMobileOpen(false)}
                className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white dark:bg-slate-800 text-slate-500 shadow-md"
              >
                <X size={20} />
              </button>
              <Sidebar close={() => setMobileOpen(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
