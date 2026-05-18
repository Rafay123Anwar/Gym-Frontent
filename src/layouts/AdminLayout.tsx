import { ReactNode, useState } from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import { LayoutDashboard, Users, CreditCard, Settings, LogOut, Menu, FileText, Layers, Sun, Moon, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const NAV_ITEMS = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/members', label: 'Members', icon: Users },
  { path: '/plans', label: 'Plans', icon: Layers },
  { path: '/payments', label: 'Payments', icon: CreditCard },
  { path: '/renewals', label: 'Renewals', icon: RefreshCw },
  { path: '/reports', label: 'Reports', icon: FileText },
  { path: '/settings', label: 'Settings', icon: Settings },
];

interface SidebarProps {
  location: any;
  onCloseMobile: () => void;
  onLogout: () => void;
}

const SidebarContent = ({ location, onCloseMobile, onLogout }: SidebarProps) => {
  const { isDarkMode, toggleTheme } = useThemeStore();

  return (
    <div className="flex flex-col h-full bg-surface border-r border-borderLine transition-colors duration-300">
      <div className="p-8">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <img 
              src="/gym_logo_1778789725222.png" 
              alt="IRON CORE" 
              className="w-10 h-10 object-contain dark:invert-0 invert transition-all duration-500"
            />
            <h1 className="text-xl font-bold text-textMain tracking-tight">IRON <span className="text-primary">CORE</span></h1>
          </div>
        </div>
        <p className="text-[10px] text-textMuted uppercase tracking-[0.2em] font-semibold mt-1">Gym Management</p>
      </div>

    <nav className="flex-1 px-4 space-y-1.5 mt-4">
      {NAV_ITEMS.map((item) => {
        const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
        return (
          <Link
            key={item.path}
            to={item.path}
            onClick={onCloseMobile}
            className={`flex items-center px-4 py-3 rounded-xl transition-all duration-300 relative group ${
              isActive 
                ? 'bg-primary/10 text-primary border border-primary/20 shadow-[0_0_20px_rgba(212,175,55,0.05)]' 
                : 'text-textMuted hover:text-textMain hover:bg-secondary'
            }`}
          >
            <item.icon className={`w-5 h-5 mr-3 transition-transform duration-300 group-hover:scale-110 ${isActive ? 'text-primary' : 'text-textMuted'}`} />
            <span className="font-medium text-sm">{item.label}</span>
            {isActive && (
              <motion.div 
                layoutId="activeTab"
                className="absolute right-3 w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_10px_#d4af37]"
              />
            )}
          </Link>
        );
      })}
    </nav>

    <div className="px-4 py-4 space-y-2 border-t border-borderLine">
      <button
        onClick={toggleTheme}
        className="flex items-center w-full px-4 py-3 text-textMain hover:bg-secondary rounded-xl transition-all group border border-transparent hover:border-borderLine"
      >
        {isDarkMode ? (
          <Sun className="w-5 h-5 mr-3 text-primary animate-pulse" />
        ) : (
          <Moon className="w-5 h-5 mr-3 text-primary" />
        )}
        <span className="font-medium text-sm">{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
      </button>

      <button
        onClick={onLogout}
        className="flex items-center w-full px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-xl transition-all group"
      >
        <LogOut className="w-5 h-5 mr-3 transition-transform group-hover:-translate-x-1" />
        <span className="font-medium text-sm">Logout</span>
      </button>
    </div>
  </div>
  );
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { isAuthenticated, logout } = useAuthStore();
  const location = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background text-textMain selection:bg-primary/30 selection:text-textMain transition-colors duration-300">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 z-20">
        <SidebarContent 
          location={location} 
          onCloseMobile={() => setIsMobileOpen(false)} 
          onLogout={logout} 
        />
      </aside>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
              className="fixed inset-y-0 left-0 w-64 z-50 lg:hidden"
            >
              <SidebarContent 
                location={location} 
                onCloseMobile={() => setIsMobileOpen(false)} 
                onLogout={logout} 
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Mobile Header */}
        <header className="lg:hidden flex items-center justify-between p-4 bg-surface/80 backdrop-blur-md border-b border-borderLine z-30 sticky top-0 transition-colors duration-300">
          <div className="flex items-center gap-2">
            <img src="/gym_logo_1778789725222.png" alt="Logo" className="w-8 h-8 dark:invert-0 invert transition-all" />
            <h1 className="text-lg font-black text-textMain tracking-tight">IRON <span className="text-primary">CORE</span></h1>
          </div>
          <button onClick={() => setIsMobileOpen(true)} className="p-2 text-textMain bg-secondary rounded-lg border border-borderLine active:scale-95 transition-all">
            <Menu className="w-5 h-5" />
          </button>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-10 relative z-10 scroll-smooth">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
        
        {/* Decorative Background Elements */}
        <div className="fixed top-[-10%] right-[-5%] w-[50vw] h-[50vw] bg-primary/5 rounded-full blur-[150px] pointer-events-none z-0 hidden lg:block animate-pulse" />
        <div className="fixed bottom-[-10%] left-[-5%] w-[40vw] h-[40vw] bg-primary/5 rounded-full blur-[120px] pointer-events-none z-0 hidden lg:block" />
      </div>
    </div>
  );
}
