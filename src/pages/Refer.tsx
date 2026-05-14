import { ReactNode, useState } from 'react';
import { UserProfile } from '../types';
import { Copy, Share2, DollarSign, Send, MessageCircle, Check } from 'lucide-react';
import { motion } from 'motion/react';
import toast from 'react-hot-toast';

interface ReferProps {
  profile: UserProfile | null;
}

export default function Refer({ profile }: ReferProps) {
  const [copied, setCopied] = useState(false);
  const referralLink = `${window.location.origin}/login?ref=${profile?.referralCode}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast.success('Referral link copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const shareTelegram = () => {
    const url = `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent('Join Shohoj World and earn money daily!')}`;
    window.open(url, '_blank');
  };

  const shareWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent('Join Shohoj World and earn money daily! ' + referralLink)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-black text-slate-800 leading-tight">Refer & Earn Forever</h2>
          <div className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-[10px] font-black uppercase">10%</div>
        </div>
        
        <p className="text-xs text-slate-400 mb-8 leading-relaxed font-medium">
          Earn 10% of your friends' earnings for life! Follow these simple steps to start:
        </p>

        <div className="space-y-8 mb-10">
          <Step 
            number={1} 
            icon={<Copy size={18} className="text-slate-400" />} 
            title="Copy Your Link" 
            desc="Grab your unique referral link below." 
          />
          <Step 
            number={2} 
            icon={<Share2 size={18} className="text-slate-400" />} 
            title="Share with Friends" 
            desc="Use the Telegram, WhatsApp buttons to share your link." 
          />
          <Step 
            number={3} 
            icon={<DollarSign size={18} className="text-slate-400" />} 
            title="Earn Lifetime Rewards" 
            desc="Get 10% of your friends' earnings forever once they join!" 
          />
        </div>

        <div className="space-y-3">
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Your Referral Link</label>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-xs text-slate-500 font-medium truncate">
              {referralLink}
            </div>
            <button 
              onClick={copyToClipboard}
              className="bg-white border border-slate-200 p-3 rounded-xl text-blue-600 shadow-sm active:scale-95 transition-transform"
            >
              {copied ? <Check size={18} /> : <Copy size={18} />}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-8">
          <button 
            onClick={shareTelegram}
            className="flex items-center justify-center gap-2 bg-[#0088CC] text-white font-bold py-3.5 rounded-xl text-xs"
          >
            <Send size={16} />
            Telegram
          </button>
          <button 
            onClick={shareWhatsApp}
            className="flex items-center justify-center gap-2 bg-[#25D366] text-white font-bold py-3.5 rounded-xl text-xs"
          >
            <MessageCircle size={16} />
            WhatsApp
          </button>
        </div>
      </div>

      <div className="text-center">
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
          Total Referrals: {profile?.referralsCount || 0}
        </p>
      </div>
    </div>
  );
}

function Step({ number, icon, title, desc }: { number: number; icon: ReactNode; title: string; desc: string }) {
  return (
    <div className="flex items-start gap-4">
      <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100 italic font-black text-slate-300 text-xs shadow-inner">
        {icon}
      </div>
      <div>
        <h4 className="text-sm font-bold text-slate-800 leading-none mb-1.5">{number}. {title}</h4>
        <p className="text-[11px] text-slate-400 font-medium leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}
