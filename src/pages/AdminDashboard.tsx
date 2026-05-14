import { useState, useEffect, ReactNode } from 'react';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, getDocs, query, limit, orderBy } from 'firebase/firestore';
import { Users, CreditCard, Wallet, TrendingUp, Settings as SettingsIcon, BarChart3, Clock } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    usersCount: 0,
    withdrawalsCount: 0,
    totalWithdrawalAmount: 0,
    pendingWithdrawalsCount: 0,
    totalUsersEarnings: 0,
    totalReferrals: 0,
    activeGateways: 2,
    lifetimeAds: 17,
    todayAds: 17
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const usersSnap = await getDocs(collection(db, 'users'));
        const withdrawalsSnap = await getDocs(collection(db, 'withdrawals'));
        
        let totalWithdrawalPaid = 0;
        let pendingWithdrawals = 0;
        withdrawalsSnap.forEach(doc => {
          const data = doc.data();
          if (data.status === 'approved') {
            totalWithdrawalPaid += data.amount || 0;
          } else if (data.status === 'pending') {
            pendingWithdrawals++;
          }
        });

        let totalEarned = 0;
        let referralsCount = 0;
        usersSnap.forEach(doc => {
          const data = doc.data();
          totalEarned += data.totalEarned || 0;
          referralsCount += data.referralsCount || 0;
        });

        setStats(prev => ({
          ...prev,
          usersCount: usersSnap.size,
          withdrawalsCount: withdrawalsSnap.size,
          totalWithdrawalAmount: totalWithdrawalPaid,
          pendingWithdrawalsCount: pendingWithdrawals,
          totalUsersEarnings: totalEarned,
          totalReferrals: referralsCount
        }));
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, 'admin_stats');
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-black text-slate-800 mb-2">Admin Dashboard</h1>
        <p className="text-slate-400 font-medium">Welcome back, here's what's happening today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <DashboardCard 
          label="Registered Users"
          value={stats.usersCount.toString()}
          subLabel="Manage all active accounts"
          icon={<Users className="text-blue-500" />}
          color="border-l-blue-500"
        />
        <DashboardCard 
          label="Total Users Earnings"
          value={`BDT ${stats.totalUsersEarnings.toFixed(2)}`}
          subLabel="Total earned by all users"
          icon={<TrendingUp className="text-purple-500" />}
          color="border-l-purple-500"
        />
        <DashboardCard 
          label="Total Referrals"
          value={stats.totalReferrals.toString()}
          subLabel="Total successful invites"
          icon={<Users className="text-indigo-500" />}
          color="border-l-indigo-500"
        />
        <DashboardCard 
          label="Pending Withdrawals"
          value={stats.pendingWithdrawalsCount.toString()}
          subLabel="Awaiting approval"
          icon={<Clock className="text-orange-500" />}
          color="border-l-orange-500"
        />
        <DashboardCard 
          label="Total Paid"
          value={`BDT ${stats.totalWithdrawalAmount.toFixed(2)}`}
          subLabel="Total withdrawals approved"
          icon={<CreditCard className="text-green-500" />}
          color="border-l-green-500"
        />
        <DashboardCard 
          label="Withdrawal Count"
          value={stats.withdrawalsCount.toString()}
          subLabel="Total payout requests"
          icon={<CreditCard className="text-slate-400" />}
          color="border-l-slate-400"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Advertising Analytics */}
        <div className="bg-white rounded-3xl p-8 border border-slate-200 border-l-4 border-l-cyan-500 shadow-sm">
          <div className="flex items-start justify-between mb-6">
             <div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Advertising Analytics</p>
               <h3 className="text-lg font-bold text-slate-800">Detailed View Tracking</h3>
             </div>
             <div className="p-3 bg-cyan-50 rounded-xl text-cyan-600">
               <BarChart3 size={24} />
             </div>
          </div>
          <div className="flex gap-6">
             <div className="flex items-center gap-2">
               <TrendingUp size={16} className="text-blue-500" />
               <span className="text-sm font-bold text-slate-600">Lifetime: {stats.lifetimeAds}</span>
             </div>
             <div className="flex items-center gap-2">
               <TrendingUp size={16} className="text-green-500" />
               <span className="text-sm font-bold text-slate-600">Today: {stats.todayAds}</span>
             </div>
          </div>
        </div>

        {/* System Management */}
        <div className="bg-white rounded-3xl p-8 border border-slate-200 border-l-4 border-l-indigo-500 shadow-sm relative overflow-hidden">
          <div className="flex items-start justify-between relative z-10">
             <div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">System Management</p>
               <h3 className="text-2xl font-black text-slate-800 mb-2">Settings & Preferences</h3>
               <p className="text-xs text-slate-400 font-medium max-w-[200px]">Configure bot settings, referral bonus, and system limits.</p>
             </div>
             <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
               <SettingsIcon size={24} />
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DashboardCard({ label, value, subLabel, icon, color }: { label: string; value: string; subLabel: string; icon: ReactNode; color: string }) {
  return (
    <motion.div 
      whileHover={{ y: -4 }}
      className={cn(
        "bg-white rounded-3xl p-8 border border-slate-200 border-l-4 shadow-sm flex items-center justify-between",
        color
      )}
    >
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
        <h3 className="text-3xl font-black text-slate-800 mb-1">{value}</h3>
        <p className="text-xs text-slate-400 font-medium">{subLabel}</p>
      </div>
      <div className="p-4 bg-slate-50 rounded-2xl">
        {icon}
      </div>
    </motion.div>
  );
}
