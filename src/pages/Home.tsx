import { ReactNode } from 'react';
import { UserProfile } from '../types';
import { Wallet, TrendingUp, Calendar, Users, ArrowRight, Video } from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';

interface HomeProps {
  profile: UserProfile | null;
}

export default function Home({ profile }: HomeProps) {
  return (
    <div className="space-y-6 pb-6">
      {/* Welcome Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
            <img src={profile?.photoURL || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lucky'} alt="" className="w-10 h-10 rounded-lg" referrerPolicy="no-referrer" />
          </div>
          <div>
            <h2 className="font-bold text-slate-800">{profile?.displayName}</h2>
            <p className="text-xs text-slate-400">@ShohojWorldUser</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">Balance</p>
          <p className="text-xl font-black text-blue-600">BDT{profile?.balance.toFixed(2)}</p>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <StatCard 
          icon={<TrendingUp className="text-orange-500" size={18} />}
          label="Total Earned"
          value={`BDT${profile?.totalEarned.toFixed(2)}`}
          bgColor="bg-orange-50"
        />
        <StatCard 
          icon={<Calendar className="text-green-500" size={18} />}
          label="LifeTime"
          value={`BDT${profile?.lifetimeEarned.toFixed(2)}`}
          bgColor="bg-green-50"
        />
        <StatCard 
          icon={<Wallet className="text-pink-500" size={18} />}
          label="Earn Today"
          value="BDT0.00"
          bgColor="bg-pink-50"
        />
        <StatCard 
          icon={<Users className="text-blue-500" size={18} />}
          label="Referrals"
          value={profile?.referralsCount.toString() || '0'}
          bgColor="bg-blue-50"
        />
      </div>

      {/* Refer & Earn Banner */}
      <motion.div 
        whileHover={{ scale: 1.02 }}
        className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 relative overflow-hidden group"
      >
        <div className="relative z-10">
          <h3 className="font-bold text-slate-800 mb-1">Refer & Earn</h3>
          <p className="text-xs text-slate-400 mb-4">Get lifetime 10% commission</p>
          <Link to="/refer" className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 text-xs font-bold px-4 py-2 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
            Start Now
            <ArrowRight size={14} />
          </Link>
        </div>
        <Users className="absolute -right-4 -bottom-4 text-blue-50 opacity-50 w-24 h-24" />
      </motion.div>

      {/* Available Tasks */}
      <div className="space-y-4">
        <h3 className="font-bold text-slate-800 text-sm px-1">Available Tasks</h3>
        
        {/* Video Ads Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileHover={{ y: -2 }}
          className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
                <Video size={24} />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <h4 className="font-bold text-slate-800 text-sm">Video & Ads</h4>
                  <span className="bg-orange-50 text-orange-600 text-[8px] font-black uppercase px-2 py-0.5 rounded italic">New</span>
                </div>
                <p className="text-xs text-slate-400">Watch short videos to earn reward</p>
              </div>
            </div>
            <Link to="/ads" className="bg-slate-900 text-white p-2 rounded-lg">
              <ArrowRight size={16} />
            </Link>
          </div>
          <Link 
            to="/ads" 
            className="w-full bg-slate-50 text-slate-800 font-bold py-3 rounded-xl flex items-center justify-center text-xs gap-2 border border-slate-100 hover:bg-slate-100 transition-colors"
          >
            Open Video Tasks
          </Link>
        </motion.div>

        {/* Telegram Tasks Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileHover={{ y: -2 }}
          className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                <Users size={24} />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <h4 className="font-bold text-slate-800 text-sm">Telegram Tasks</h4>
                  <span className="bg-blue-50 text-blue-600 text-[8px] font-black uppercase px-2 py-0.5 rounded italic">Loyal</span>
                </div>
                <p className="text-xs text-slate-400">Join channels for big rewards</p>
              </div>
            </div>
            <Link to="/tasks" className="bg-slate-900 text-white p-2 rounded-lg">
              <ArrowRight size={16} />
            </Link>
          </div>
          <Link 
            to="/tasks" 
            className="w-full bg-slate-50 text-slate-800 font-bold py-3 rounded-xl flex items-center justify-center text-xs gap-2 border border-slate-100 hover:bg-slate-100 transition-colors"
          >
            Open Telegram Tasks
          </Link>
        </motion.div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, bgColor }: { icon: ReactNode; label: string; value: string; bgColor: string }) {
  return (
    <motion.div 
      whileTap={{ scale: 0.98 }}
      className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100"
    >
      <div className="flex items-center gap-2 mb-3">
        <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", bgColor)}>
          {icon}
        </div>
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">{label}</span>
      </div>
      <p className="text-lg font-black text-slate-800">{value}</p>
    </motion.div>
  );
}
