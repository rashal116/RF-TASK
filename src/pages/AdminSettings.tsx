import React, { useState, useEffect, ReactNode } from 'react';
import { db } from '../lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { AppSettings } from '../types';
import { Save, RefreshCcw, ShieldCheck, Zap, HandCoins, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '../lib/utils';

export default function AdminSettings() {
  const [settings, setSettings] = useState<AppSettings>({
    minWithdrawal: 100,
    minReferralsForWithdraw: 10,
    referralBonusPercent: 10,
    adLimitHourly: 20,
    adLimitDaily: 60
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      const snap = await getDoc(doc(db, 'settings', 'global'));
      if (snap.exists()) {
        setSettings(snap.data() as AppSettings);
      }
      setLoading(false);
    };
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await setDoc(doc(db, 'settings', 'global'), settings);
      toast.success('Settings updated successfully!');
    } catch (error: any) {
      toast.error('Failed to save settings: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center p-20"><RefreshCcw className="animate-spin text-blue-600" /></div>;

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Global Settings</h1>
          <p className="text-xs text-slate-400 font-medium">Configure platform rules and limits</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <SettingsGroup 
          title="Withdrawal Rules" 
          icon={<HandCoins className="text-indigo-600" />}
          color="border-l-indigo-500"
        >
          <div className="grid grid-cols-1 gap-6">
            <InputField 
              label="Minimum Withdrawal (BDT)" 
              value={settings.minWithdrawal}
              onChange={val => setSettings({...settings, minWithdrawal: parseFloat(val)})}
            />
            <InputField 
              label="Min Referrals Required" 
              value={settings.minReferralsForWithdraw}
              onChange={val => setSettings({...settings, minReferralsForWithdraw: parseInt(val)})}
            />
          </div>
        </SettingsGroup>

        <SettingsGroup 
          title="Referral & Bonus" 
          icon={<Users className="text-blue-600" />}
          color="border-l-blue-500"
        >
          <div className="grid grid-cols-1 gap-6">
            <InputField 
              label="Referral Commission (%)" 
              value={settings.referralBonusPercent}
              onChange={val => setSettings({...settings, referralBonusPercent: parseFloat(val)})}
            />
          </div>
        </SettingsGroup>

        <SettingsGroup 
          title="Advertising Limits" 
          icon={<Zap className="text-orange-600" />}
          color="border-l-orange-500"
        >
          <div className="grid grid-cols-1 gap-6">
            <InputField 
              label="Ads Limit per Hour" 
              value={settings.adLimitHourly}
              onChange={val => setSettings({...settings, adLimitHourly: parseInt(val)})}
            />
            <InputField 
              label="Ads Limit per Day" 
              value={settings.adLimitDaily}
              onChange={val => setSettings({...settings, adLimitDaily: parseInt(val)})}
            />
          </div>
        </SettingsGroup>

        <SettingsGroup 
          title="System Security" 
          icon={<ShieldCheck className="text-green-600" />}
          color="border-l-green-500"
        >
           <p className="text-xs text-slate-400 font-medium leading-relaxed">
             Security rules are managed via Firestore Security Rules. All actions are logged and authenticated.
           </p>
        </SettingsGroup>

        <div className="lg:col-span-2 flex justify-end pt-6">
           <button 
            disabled={saving}
            type="submit" 
            className="bg-blue-600 text-white font-black px-12 py-4 rounded-2xl shadow-xl shadow-blue-100 flex items-center gap-3 hover:bg-blue-700 transition-all disabled:opacity-50 active:scale-[0.98]"
           >
             {saving ? <RefreshCcw className="animate-spin" size={20} /> : <Save size={20} />}
             Save All Changes
           </button>
        </div>
      </form>
    </div>
  );
}

function SettingsGroup({ title, icon, color, children }: { title: string; icon: ReactNode; color: string; children: ReactNode }) {
  return (
    <div className={cn("bg-white rounded-3xl p-8 border border-slate-200 border-l-4 shadow-sm", color)}>
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2 bg-slate-50 rounded-xl">
          {icon}
        </div>
        <h3 className="font-black text-slate-800 text-sm uppercase tracking-widest">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function InputField({ label, value, onChange }: { label: string; value: number; onChange: (val: string) => void }) {
  return (
    <div>
      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">{label}</label>
      <input 
        type="number" 
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3.5 px-5 text-sm font-bold text-slate-800 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
      />
    </div>
  );
}
