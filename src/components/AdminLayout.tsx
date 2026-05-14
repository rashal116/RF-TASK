import { useState, ReactNode } from 'react';
import { Outlet, NavLink, Link } from 'react-router-dom';
import { 
  BarChart3, Users, CreditCard, Send, Settings, Menu, X, 
  ChevronRight, LogOut, Shield, MessageSquare
} from 'lucide-react';
import { cn } from '../lib/utils';
import { auth } from '../lib/firebase';

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">
      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 w-72 bg-white z-50 transform transition-transform duration-300 ease-in-out border-r border-slate-200 lg:relative lg:translate-x-0 flex flex-col",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6 h-20 flex items-center justify-between border-b border-slate-50">
          <Link to="/admin" className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-200">
               <Shield size={24} />
             </div>
             <span className="font-black text-slate-800 tracking-tight text-xl">ADMIN</span>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-2 text-slate-400">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 p-6 space-y-8">
          <div>
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mb-4">Main Menu</p>
            <div className="space-y-1">
              <AdminNavItem to="/admin" icon={<BarChart3 size={20} />} label="Dashboard" />
              <AdminNavItem to="/admin/users" icon={<Users size={20} />} label="Users List" />
              <AdminNavItem to="/admin/withdrawals" icon={<CreditCard size={20} />} label="Withdrawals" />
              <AdminNavItem to="/admin/payment-methods" icon={<CreditCard size={20} />} label="Payment Methods" />
              <AdminNavItem to="/admin/tasks" icon={<Send size={20} />} label="Telegram Tasks" />
              <AdminNavItem to="/admin/settings" icon={<Settings size={20} />} label="Global Settings" />
            </div>
          </div>
        </nav>

        <div className="p-6 border-t border-slate-50 space-y-4">
          <button className="w-full bg-blue-600 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-blue-100 hover:bg-blue-700 transition-colors">
            <MessageSquare size={18} />
            Broadcast Message
          </button>
          <button 
            onClick={() => auth.signOut()}
            className="w-full flex items-center gap-3 p-3 text-slate-400 hover:text-red-500 transition-colors text-sm font-bold"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 relative z-30">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-slate-400 hover:bg-slate-50 rounded-lg transition-colors"
            >
              <Menu size={24} />
            </button>
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest hidden md:block">System Management</h2>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col items-end mr-2">
              <span className="text-sm font-bold text-slate-800">Administrator</span>
              <span className="text-[10px] text-blue-500 font-bold uppercase tracking-tighter">rashaltechworld@gmail.com</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden">
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Admin" alt="Admin" className="w-full h-full object-cover" />
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 md:p-10">
          <div className="max-w-6xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

function AdminNavItem({ to, icon, label }: { to: string; icon: ReactNode; label: string }) {
  return (
    <NavLink 
      to={to} 
      end
      className={({ isActive }) => cn(
        "flex items-center justify-between p-3.5 rounded-xl text-sm font-bold transition-all",
        isActive 
          ? "bg-blue-50 text-blue-600 shadow-sm shadow-blue-100/50" 
          : "text-slate-400 hover:bg-slate-50 hover:text-slate-600"
      )}
    >
      <div className="flex items-center gap-4">
        {icon}
        <span>{label}</span>
      </div>
      <ChevronRight size={14} className={cn("transition-opacity", "opacity-0")} />
    </NavLink>
  );
}
