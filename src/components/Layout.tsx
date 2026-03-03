import React from 'react';
import { TrendingUp, Users, DollarSign, Activity, AlertTriangle, Lightbulb, ArrowUpRight, ArrowDownRight, LayoutDashboard, FileUp, PieChart, Settings, Moon, Sun, Menu, X, LogOut } from 'lucide-react';
import { cn } from '../utils/helpers';
import { User } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  user: User | null;
  onLogout: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab, isDarkMode, toggleDarkMode, user, onLogout }) => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(window.innerWidth >= 1024);

  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'upload', label: 'Data Upload', icon: FileUp },
    { id: 'reports', label: 'AI Reports', icon: PieChart },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className={cn("min-h-screen flex transition-colors duration-300", isDarkMode ? "bg-zinc-950 text-zinc-100" : "bg-zinc-50 text-zinc-900")}>
      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 transition-transform duration-300 transform border-r",
        isDarkMode ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-200",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          <div className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
                <PieChart className="text-white w-5 h-5" />
              </div>
              <span className="text-xl font-bold tracking-tight">VisionDesk</span>
            </div>
          </div>

          <nav className="flex-1 px-4 space-y-1">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                  activeTab === item.id
                    ? (isDarkMode ? "bg-emerald-500/10 text-emerald-400" : "bg-emerald-50 text-emerald-600")
                    : (isDarkMode ? "text-zinc-400 hover:bg-zinc-800" : "text-zinc-500 hover:bg-zinc-100")
                )}
              >
                <item.icon className={cn("w-5 h-5", activeTab === item.id ? "text-emerald-500" : "text-zinc-400 group-hover:text-zinc-300")} />
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="p-4 border-t border-zinc-800/50">
            <button 
              onClick={onLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-zinc-500 hover:text-zinc-400 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className={cn(
        "flex-1 transition-all duration-300",
        isSidebarOpen && "lg:ml-64"
      )}>
        {/* Top Navbar */}
        <header className={cn(
          "sticky top-0 z-40 h-16 border-b flex items-center justify-between px-6 backdrop-blur-md",
          isDarkMode ? "bg-zinc-950/80 border-zinc-800" : "bg-white/80 border-zinc-200"
        )}>
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-zinc-800/50 rounded-lg transition-colors">
            <Menu className="w-6 h-6" />
          </button>

          <div className="flex items-center gap-4 ml-auto">
            <button
              onClick={toggleDarkMode}
              className={cn(
                "p-2 rounded-full transition-colors",
                isDarkMode ? "bg-zinc-800 text-zinc-400 hover:text-zinc-100" : "bg-zinc-100 text-zinc-500 hover:text-zinc-900"
              )}
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-zinc-800">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 overflow-hidden flex items-center justify-center text-emerald-500 font-bold text-xs">
                {user?.avatar ? <img src={user.avatar} alt={user.name} referrerPolicy="no-referrer" /> : user?.name.charAt(0)}
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium">{user?.name || 'Guest'}</p>
                <p className="text-xs text-zinc-500">{user?.email || 'Not signed in'}</p>
              </div>
            </div>
          </div>
        </header>

        <div className="p-6 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};
