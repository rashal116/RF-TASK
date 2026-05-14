import React, { useState, useEffect, ReactNode } from 'react';
import { UserProfile, AppSettings } from '../types';
import { db } from '../lib/firebase';
import { collection, addDoc, doc, getDoc, serverTimestamp } from 'firebase/firestore';
import { motion } from 'motion/react';
import { CreditCard, Info, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '../lib/utils';

interface WithdrawProps {
  profile: UserProfile | null;
}

export default function Withdraw({ profile }: WithdrawProps) {
  const [amount, setAmount] = useState('');
  const [address, setAddress] = useState('');
  const [method, setMethod] = useState<'Bkash' | 'Nagad'>('Bkash');
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      const snap = await getDoc(doc(db, 'settings', 'global'));
      if (snap.exists()) {
        setSettings(snap.data() as AppSettings);
      } else {
        // Fallback defaults
        setSettings({
          minWithdrawal: 100,
          minReferralsForWithdraw: 10,
          referralBonusPercent: 10,
          adLimitHourly: 20,
          adLimitDaily: 60
        });
      }
    };
    fetchSettings();
  }, []);

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !settings) return;

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount < settings.minWithdrawal) {
      toast.error(`Minimum withdrawal is BDT${settings.minWithdrawal}`);
      return;
    }

    if (numAmount > profile.balance) {
      toast.error('Insufficient balance');
      return;
    }

    if (profile.referralsCount < settings.minReferralsForWithdraw) {
      toast.error(`Minimum ${settings.minReferralsForWithdraw} referrals required`);
      return;
    }

    if (!address) {
      toast.error('Please enter withdrawal address');
      return;
    }

    setSubmitting(true);
    try {
      await addDoc(collection(db, 'withdrawals'), {
        userId: profile.uid,
        userEmail: profile.email,
        amount: numAmount,
        method,
        address,
        status: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      
      toast.success('Withdrawal request submitted!');
      setAmount('');
      setAddress('');
    } catch (error: any) {
      toast.error('Withdrawal failed: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black text-slate-800">Withdraw Funds</h2>
        <div className="bg-orange-50 text-orange-600 px-3 py-1.5 rounded-xl border border-orange-100 flex items-center gap-2">
          <WalletIcon className="w-4 h-4" />
          <span className="text-xs font-bold">BDT{profile?.balance.toFixed(2)}</span>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl flex gap-3">
        <Info className="text-amber-500 shrink-0" size={20} />
        <p className="text-xs text-amber-800 font-medium leading-relaxed">
          Minimum {settings?.minReferralsForWithdraw || 10} referrals required. (Current: {profile?.referralsCount || 0})
        </p>
      </div>

      <form onSubmit={handleWithdraw} className="space-y-6">
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Amount</label>
          <div className="relative">
            <input 
              type="number" 
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount" 
              className="w-full bg-white border border-slate-200 rounded-2xl py-4 pl-5 pr-14 text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
            <span className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">BDT</span>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Withdrawal Address</label>
          <input 
            type="text" 
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Enter wallet or account address" 
            className="w-full bg-white border border-slate-200 rounded-2xl py-4 px-5 text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all mb-2"
          />
          <p className="text-[10px] text-slate-400 px-1 font-medium italic">
            Enter the address for your selected payment method (e.g., Bkash/Nagad number)
          </p>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 ml-1">Payment Method</label>
          <div className="grid grid-cols-2 gap-4">
            <MethodButton 
              active={method === 'Bkash'} 
              onClick={() => setMethod('Bkash')} 
              label="Bkash" 
              icon="B" 
              color="bg-pink-600"
            />
            <MethodButton 
              active={method === 'Nagad'} 
              onClick={() => setMethod('Nagad')} 
              label="Nagad" 
              icon="N" 
              color="bg-orange-600"
            />
          </div>
        </div>

        <button 
          disabled={submitting}
          type="submit"
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-5 rounded-2xl shadow-lg shadow-blue-200 active:scale-[0.98] transition-transform disabled:opacity-50"
        >
          {submitting ? 'Processing...' : 'Request Withdrawal'}
        </button>
      </form>
    </div>
  );
}

function MethodButton({ active, onClick, label, icon, color }: { active: boolean; onClick: () => void; label: string; icon: string; color: string }) {
  return (
    <button 
      type="button"
      onClick={onClick}
      className={cn(
        "relative py-6 rounded-2xl border transition-all flex flex-col items-center justify-center gap-2",
        active ? "bg-white border-blue-500 shadow-xl shadow-blue-100" : "bg-white border-slate-100 grayscale opacity-60"
      )}
    >
      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg", color)}>
        {icon}
      </div>
      <span className="text-xs font-black text-slate-800">{label}</span>
      {active && <CheckCircle2 className="absolute top-2 right-2 text-blue-500" size={16} />}
    </button>
  );
}

function WalletIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/><polyline points="7 10 12 15 17 10"/></svg>
  );
}
