import { useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  Briefcase,
  ClipboardList,
  Compass,
  FileText,
  Home,
  LogOut,
  Map,
  Menu,
  MessageSquare,
  PenLine,
  Search,
  Sparkles,
  User,
  X,
  Zap,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";

const navigationSections = [
  {
    title: "CAREEROS",
    items: [
      { to: "/dashboard", label: "Dashboard", icon: Home },
    ],
  },
  {
    title: "DISCOVER",
    items: [
      { to: "/jobs", label: "Find Jobs", icon: Briefcase },
      { to: "/applications", label: "Job Applications", icon: ClipboardList },
    ],
  },
  {
    title: "CAREER INTELLIGENCE",
    items: [
      { to: "/fit", label: "AI Job Analyzer", icon: Sparkles },
      { to: "/career-predict", label: "Career Predictor", icon: Compass },
      { to: "/roadmap", label: "Learning Roadmap", icon: Map },
    ],
  },
  {
    title: "AI TOOLS",
    items: [
      { to: "/resume", label: "Resume Optimizer", icon: FileText },
      { to: "/cover-letter", label: "Cover Letter", icon: PenLine },
      { to: "/interview", label: "Interview Prep", icon: MessageSquare },
    ],
  },
  {
    title: "ACCOUNT",
    items: [
      { to: "/profile", label: "My Profile", icon: User },
    ],
  },
];

function SidebarContent({ closeMobile }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside className="flex h-full flex-col bg-white border-r border-slate-200 w-[250px] select-none">
      {/* Brand Header */}
      <div className="flex h-16 items-center px-6 border-b border-slate-200">
        <NavLink
          to="/dashboard"
          className="flex items-center gap-2.5"
          onClick={closeMobile}
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-700 text-white shadow-sm">
            <Zap size={18} strokeWidth={2.5} />
          </div>
          <div>
            <span className="text-base font-bold tracking-tight text-slate-900">CareerOS</span>
            <span className="ml-1 text-xs font-semibold text-brand-700 bg-brand-50 px-1.5 py-0.5 rounded">AI</span>
          </div>
        </NavLink>
      </div>

      {/* Navigation Sections */}
      <nav className="flex-1 space-y-6 px-3 py-5 overflow-y-auto soft-scroll">
        {navigationSections.map((section) => (
          <div key={section.title}>
            <p className="px-3 text-[10px] font-bold tracking-wider text-slate-400 uppercase mb-1.5">
              {section.title}
            </p>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={closeMobile}
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                        isActive
                          ? "bg-brand-700 text-white shadow-sm font-semibold"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <Icon
                          size={18}
                          className={isActive ? "text-white" : "text-slate-400 group-hover:text-slate-600"}
                          strokeWidth={isActive ? 2.2 : 1.8}
                        />
                        <span>{item.label}</span>
                      </>
                    )}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom User Profile & Logout */}
      <div className="border-t border-slate-200 p-3 bg-slate-50/50">
        <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-2.5 shadow-sm">
          <NavLink
            to="/profile"
            onClick={closeMobile}
            className="flex items-center gap-2.5 min-w-0 flex-1 hover:opacity-80 transition-opacity"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-800 text-xs font-bold">
              {user?.name?.[0]?.toUpperCase() || "U"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-slate-900">{user?.name || "Candidate"}</p>
              <p className="truncate text-[11px] text-slate-500">{user?.targetRole || user?.email || "CareerOS User"}</p>
            </div>
          </NavLink>
          <button
            onClick={handleLogout}
            title="Log out"
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/jobs?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // Determine page title based on location
  const getPageTitle = () => {
    const p = location.pathname;
    if (p.includes("/dashboard")) return "Dashboard";
    if (p.includes("/jobs")) return "Find Jobs";
    if (p.includes("/applications")) return "Application Tracker";
    if (p.includes("/fit")) return "AI Job Fit Analyzer";
    if (p.includes("/career-predict")) return "Career Role Predictor";
    if (p.includes("/roadmap")) return "Learning Roadmap";
    if (p.includes("/resume")) return "Resume Optimizer";
    if (p.includes("/cover-letter")) return "Cover Letter Generator";
    if (p.includes("/interview")) return "AI Interview Preparation";
    if (p.includes("/profile")) return "Profile Settings";
    return "Dashboard";
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans flex">
      {/* Desktop Sidebar (Fixed) */}
      <div className="hidden md:fixed md:inset-y-0 md:flex md:w-[250px] md:flex-col z-30">
        <SidebarContent />
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col md:pl-[250px] min-w-0">
        {/* Sticky Top Header */}
        <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white/95 backdrop-blur-sm px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="p-2 text-slate-500 hover:text-slate-800 md:hidden"
              aria-label="Open menu"
            >
              <Menu size={20} />
            </button>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-400 hidden sm:inline">Platform /</span>
              <h1 className="text-sm font-semibold text-slate-800">{getPageTitle()}</h1>
            </div>
          </div>

          {/* Quick Search */}
          <div className="flex items-center gap-4">
            <form onSubmit={handleSearchSubmit} className="relative hidden sm:block w-64 lg:w-80">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Quick search jobs & roles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 pl-9 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none transition-all"
              />
            </form>

            <NavLink
              to="/profile"
              className="flex items-center gap-2.5 py-1 px-2 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-700 text-white text-xs font-bold">
                {user?.name?.[0]?.toUpperCase() || "U"}
              </div>
              <span className="hidden sm:inline text-xs font-semibold text-slate-700">
                {user?.name?.split(" ")[0] || "User"}
              </span>
            </NavLink>
          </div>
        </header>

        {/* Dynamic Page Outlet */}
        <main className="flex-1 py-6 px-4 sm:px-6 lg:px-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm md:hidden"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.25 }}
              className="fixed inset-y-0 left-0 z-50 w-[260px] md:hidden shadow-xl"
            >
              <button
                onClick={() => setMobileOpen(false)}
                className="absolute top-4 right-3 p-1.5 text-slate-400 hover:text-slate-700 z-50"
              >
                <X size={18} />
              </button>
              <SidebarContent closeMobile={() => setMobileOpen(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
