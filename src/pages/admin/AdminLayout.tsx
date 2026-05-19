import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import {
  LayoutDashboard,
  FileText,
  Images,
  Heart,
  Settings,
  LogOut,
  Menu,
  Globe,
  X,
  Quote,
  MessageSquare,
} from "lucide-react";
import { useState } from "react";
import logo from "../../assets/logo.webp";

const navItems = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/content", label: "Website Content", icon: FileText, end: false },
  { to: "/admin/gallery", label: "Gallery", icon: Images, end: false },
  { to: "/admin/testimonials", label: "Testimonials", icon: Quote, end: false },
  { to: "/admin/messages", label: "Messages", icon: MessageSquare, end: false },
  { to: "/admin/donations", label: "Donations", icon: Heart, end: false },
  { to: "/admin/settings", label: "Settings", icon: Settings, end: false },
];

export default function AdminLayout() {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  function handleLogout() {
    logout();
    navigate("/admin/login", { replace: true });
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="px-5 py-5 border-b border-neutral-800">
        <div className="flex items-center gap-3">
          <img
            src={logo}
            alt="Logo"
            className="h-9 w-9 rounded-full object-cover ring-2 ring-primary-700 transition-transform duration-200 hover:scale-105"
          />
          <div>
            <div className="text-white font-semibold text-sm leading-tight">Admin Panel</div>
            <div className="text-neutral-400 text-xs mt-0.5">{admin?.username}</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200 ${isActive
                ? "bg-primary-600 text-white shadow-md shadow-primary-900/30"
                : "text-neutral-400 hover:text-white hover:bg-neutral-800"
              }`
            }
          >
            <item.icon size={17} className="shrink-0" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-neutral-800 space-y-0.5">
        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors hover:translate-x-0.5"
        >
          <Globe size={17} />
          View Website
        </a>
        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-neutral-400 hover:text-red-400 hover:bg-neutral-800 transition-colors text-left hover:translate-x-0.5"
        >
          <LogOut size={17} />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-neutral-100 flex">
      <aside className="hidden lg:flex w-60 bg-neutral-900 flex-col fixed inset-y-0 left-0 z-30">
        <SidebarContent />
      </aside>

      {sidebarOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]"
            onClick={() => setSidebarOpen(false)}
            aria-hidden
          />
          <aside className="lg:hidden fixed inset-y-0 left-0 z-50 w-60 max-w-[85vw] bg-neutral-900 flex flex-col shadow-2xl animate-[slideInLeft_0.25s_ease-out]">
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-white transition-colors p-1"
              aria-label="Close menu"
            >
              <X size={18} />
            </button>
            <SidebarContent />
          </aside>
        </>
      )}

      <div className="flex-1 lg:ml-60 flex flex-col min-h-screen">
        <header className="bg-white border-b border-neutral-200 px-4 sm:px-6 h-14 flex items-center justify-between sticky top-0 z-20 shadow-sm">
          <button
            type="button"
            className="lg:hidden p-2 rounded-lg text-neutral-600 hover:bg-neutral-100 transition-colors active:scale-95"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>
          <div className="hidden lg:block" />
          <div className="flex items-center gap-3">
            <div className="text-sm text-neutral-500">
              Signed in as <span className="font-semibold text-neutral-900">{admin?.username}</span>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-neutral-600 hover:text-red-600 rounded-lg hover:bg-neutral-100 transition-colors hover:scale-[1.02] active:scale-95"
            >
              <LogOut size={15} />
              Logout
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
