import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../lib/firebase';
import { UserProfile } from '../types';
import { LogOut, HelpCircle, Phone, Shield, ArrowRight, Settings, Gift } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import toast from 'react-hot-toast';

interface ProfileProps {
  profile: UserProfile | null;
}

export default function Profile({ profile }: ProfileProps) {
  const navigate = useNavigate();
  const handleLogout = () => {
    auth.signOut();
  };

  const handleMenuClick = (action: string) => {
    switch (action) {
      case 'help':
        navigate('/support');
        break;
      case 'contact':
        window.open('https://t.me/shohojworld_admin', '_blank');
        break;
      case 'bonus':
        toast.success('Complete more tasks to unlock elite bonuses!');
        break;
      case 'settings':
        toast('Account settings coming soon!');
        break;
      default:
        break;
    }
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Profile Header */}
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 flex flex-col items-center text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-blue-50 to-transparent opacity-50" />
        
        <div className="relative z-10 mb-5">
          <div className="w-24 h-24 rounded-full p-1 bg-white border-4 border-blue-50 shadow-xl mx-auto">
            <img 
              src={profile?.photoURL || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lucky'} 
              alt="Profile" 
              className="w-full h-full rounded-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-blue-600 border-4 border-white flex items-center justify-center text-white shadow-lg">
             <Shield size={12} fill="white" />
          </div>
        </div>

        <div className="relative z-10">
          <h2 className="text-xl font-black text-slate-800 mb-1">{profile?.displayName}</h2>
          <p className="text-xs text-blue-500 font-bold uppercase tracking-widest">{profile?.status || 'Active'}</p>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 px-1">Your Statistics</h3>
        <div className="grid grid-cols-2 gap-y-6 gap-x-8">
           <ProfileStat label="Total Earned" value={`BDT${profile?.totalEarned.toFixed(2)}`} color="text-orange-500" bgColor="bg-orange-50" />
           <ProfileStat label="LifeTime Earn" value={`BDT${profile?.lifetimeEarned.toFixed(2)}`} color="text-green-500" bgColor="bg-green-50" />
           <ProfileStat label="Earn Today" value="BDT0.00" color="text-pink-500" bgColor="bg-pink-50" />
           <ProfileStat label="Referrals" value={profile?.referralsCount.toString() || '0'} color="text-blue-500" bgColor="bg-blue-50" />
        </div>
      </div>

      {/* Menu Options */}
      <div className="space-y-3">
        <MenuButton 
          onClick={() => handleMenuClick('help')}
          icon={<HelpCircle size={20} />} 
          label="Help Center" 
          subLabel="Get support & guides" 
        />
        <MenuButton 
          onClick={() => handleMenuClick('contact')}
          icon={<Phone size={20} />} 
          label="Developer Contact" 
          subLabel="Talk to the tech team" 
        />
        <MenuButton 
          onClick={() => handleMenuClick('bonus')}
          icon={<Gift size={20} />} 
          label="Bonus Rewards" 
          subLabel="Extra earnings for top users" 
        />
        <MenuButton 
          onClick={() => handleMenuClick('settings')}
          icon={<Settings size={20} />} 
          label="Account Settings" 
          subLabel="Privacy and preferences" 
        />
        
        <button 
          onClick={handleLogout}
          className="w-full bg-white rounded-2xl p-4 flex items-center justify-between border border-red-50 text-red-500 hover:bg-red-50 transition-colors shadow-sm group"
        >
          <div className="flex items-center gap-4 text-left">
            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center group-hover:bg-white transition-colors">
              <LogOut size={20} />
            </div>
            <span className="font-bold text-sm">Log Out</span>
          </div>
          <ArrowRight size={18} className="opacity-30" />
        </button>
      </div>
    </div>
  );
}

function ProfileStat({ label, value, color, bgColor }: { label: string; value: string; color: string; bgColor: string }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2 mb-2">
        <div className={cn("w-2 h-2 rounded-full", bgColor)} />
        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">{label}</span>
      </div>
      <p className={cn("text-base font-black truncate leading-tight", color)}>{value}</p>
    </div>
  );
}

function MenuButton({ icon, label, subLabel, onClick }: { icon: ReactNode; label: string; subLabel: string; onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className="w-full bg-white rounded-2xl p-4 flex items-center justify-between border border-slate-100 shadow-sm active:scale-[0.99] transition-transform group"
    >
      <div className="flex items-center gap-4 text-left">
        <div className="w-11 h-11 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
          {icon}
        </div>
        <div>
          <h4 className="font-bold text-slate-800 text-sm leading-none mb-1">{label}</h4>
          <p className="text-[10px] text-slate-400 font-medium">{subLabel}</p>
        </div>
      </div>
      <ArrowRight size={18} className="text-slate-200 group-hover:text-blue-500 transition-colors" />
    </button>
  );
}
