import { ReactNode } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { Home, Play, Send, Users, CreditCard, User as UserIcon } from 'lucide-react';
import { UserProfile } from '../types';
import { cn } from '../lib/utils';

interface LayoutProps {
  profile: UserProfile | null;
}

export default function Layout({ profile }: LayoutProps) {
  return (
    <div className="flex flex-col min-h-screen bg-[#F0F7FF]">
      {/* Mobile Header (Optional, but match screenshots) */}
      <header className="fixed top-0 left-0 right-0 h-14 bg-white border-b flex items-center justify-between px-4 z-50">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden">
            <img src={profile?.photoURL || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lucky'} alt="User" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-800 line-clamp-1">{profile?.displayName || 'User'}</h1>
            <p className="text-[10px] text-blue-500 font-medium">Active</p>
          </div>
        </div>
        <div className="bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
          <span className="text-xs font-bold text-slate-700">BDT{profile?.balance.toFixed(2) || '0.00'}</span>
        </div>
      </header>

      <main className="flex-1 mt-14 mb-20 overflow-y-auto w-full max-w-md mx-auto px-4 py-4">
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t h-16 flex items-center justify-around px-2 z-50 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
        <NavItem to="/" icon={<Home size={20} />} label="Home" />
        <NavItem to="/ads" icon={<Play size={20} />} label="Ads Task" />
        <NavItem to="/telegram" icon={<Send size={20} />} label="TG Tasks" />
        <NavItem to="/refer" icon={<Users size={20} />} label="Refer" />
        <NavItem to="/withdraw" icon={<CreditCard size={20} />} label="Withdraw" />
        <NavItem to="/profile" icon={<UserIcon size={20} />} label="Profile" />
      </nav>
    </div>
  );
}

function NavItem({ to, icon, label }: { to: string; icon: ReactNode; label: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          "flex flex-col items-center justify-center space-y-1 w-14 h-full transition-colors",
          isActive ? "text-blue-600" : "text-slate-400"
        )
      }
    >
      <div className={cn("transition-transform", "active:scale-95")}>
        {icon}
      </div>
      <span className="text-[10px] font-medium">{label}</span>
      <div className={cn("h-1 w-1 rounded-full bg-blue-600 opacity-0 transition-opacity mt-0.5", "active:opacity-100")} />
    </NavLink>
  );
}
