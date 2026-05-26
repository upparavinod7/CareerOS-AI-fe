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
    <aside className="flex h-full flex-col bg-white dark:bg-[#000] border-r border-gray-200 dark:border-[#222] w-[260px] relative z-20">
      <div className="flex h-16 items-center border-b border-gray-200 dark:border-[#222] px-6">
        <div className="flex items-center gap-2.5 text-black dark:text-white">
          <LineChart size={24} strokeWidth={2.5} />
          <span className="text-lg font-bold tracking-tight">CareerOS</span>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-4 py-6 overflow-y-auto soft-scroll">
        <div className="mb-4 px-2">
          <p className="text-xs font-semibold tracking-wider text-gray-500 dark:text-gray-400 uppercase">Core Platform</p>
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
                    ? "bg-gray-100 text-black dark:bg-[#111] dark:text-white"
                    : "text-gray-600 hover:bg-gray-50 hover:text-black dark:text-gray-400 dark:hover:bg-[#111] dark:hover:text-white"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={18} className={isActive ? "text-black dark:text-white" : "text-gray-400 group-hover:text-gray-600 dark:text-gray-500 dark:group-hover:text-gray-300"} />
                  {item.label}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>
      
      <div className="border-t border-gray-200 dark:border-[#222] p-4 text-sm">
        <div className="flex items-center gap-3 rounded-lg border border-gray-200 dark:border-[#222] bg-white dark:bg-[#0a0a0a] p-3 shadow-sm transition-all hover:border-gray-300 dark:hover:border-[#333]">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-black dark:bg-white text-sm font-bold text-white dark:text-black shadow-none">
             {user?.name?.[0]?.toUpperCase() || "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="truncate font-medium text-black dark:text-white">{user?.name}</p>
            <p className="truncate text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
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
    <div className="min-h-screen text-gray-900 dark:text-gray-50 bg-white dark:bg-[#000] font-sans transition-colors duration-300">
      {/* Desktop Sidebar */}
      <div className="hidden md:fixed md:inset-y-0 md:flex md:w-[260px] md:flex-col">
        <Sidebar />
      </div>

      <div className="flex flex-1 flex-col md:pl-[260px]">
        {/* Top Header */}
        <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between gap-x-4 border-b border-gray-200 dark:border-[#222] bg-white dark:bg-[#000] px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <button
              onClick={() => setMobileOpen(true)}
              className="-m-2.5 p-2.5 text-gray-500 hover:text-gray-600 dark:text-gray-400 md:hidden"
            >
              <Menu size={24} />
            </button>
            
            <form className="relative flex flex-1" action="#" method="GET" onSubmit={(e) => { e.preventDefault(); navigate(`/jobs?q=${encodeURIComponent(query)}`); }}>
              <label htmlFor="search-field" className="sr-only">Search</label>
              <Search className="pointer-events-none absolute inset-y-0 left-0 h-full w-5 text-gray-400 dark:text-gray-500" aria-hidden="true" />
              <input
                id="search-field"
                className="block h-full w-full border-0 py-0 pl-8 pr-0 text-black dark:text-white placeholder:text-gray-400 bg-transparent focus:ring-0 sm:text-sm"
                placeholder="Search jobs, roles, companies..."
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </form>

            <div className="flex items-center gap-x-4 lg:gap-x-6">
              <button 
                onClick={() => navigate('/profile')}
                className="-m-2.5 p-2.5 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
              >
                <User size={20} />
              </button>
              <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-200 dark:lg:bg-[#333]" aria-hidden="true" />
              <button 
                onClick={logout}
                className="-m-2.5 p-2.5 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
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
