import { motion } from 'motion/react';
import { HelpCircle, MessageCircle, Mail, ExternalLink, ChevronRight, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Support() {
  const faqs = [
    {
      q: "How to earn BDT?",
      a: "You can earn by watching video ads, completing Telegram tasks, and referring your friends."
    },
    {
      q: "When will I get my withdrawal?",
      a: "Withdrawals are usually processed within 24-48 hours after verification."
    },
    {
      q: "The ad is not loading?",
      a: "Please check your internet connection or try clearing your browser cache."
    },
    {
      q: "Referral not counted?",
      a: "Your friend must join using your link and complete at least one task for the referral to be counted."
    }
  ];

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center gap-4 mb-4">
        <Link to="/profile" className="p-2 bg-white rounded-xl border border-slate-100 shadow-sm text-slate-400">
          <ChevronRight className="rotate-180" size={20} />
        </Link>
        <div>
          <h2 className="text-xl font-black text-slate-800 leading-tight">Help Center</h2>
          <p className="text-xs text-slate-400 font-medium tracking-tight">Need assistance? We're here to help.</p>
        </div>
      </div>

      {/* Support Channels */}
      <div className="grid grid-cols-1 gap-3">
        <ContactCard 
          icon={<MessageCircle className="text-blue-500" />}
          title="Telegram Support"
          desc="Chat with us on Telegram"
          link="https://t.me/shohojworld_support"
          color="bg-blue-50"
        />
        <ContactCard 
          icon={<Mail className="text-purple-500" />}
          title="Email Support"
          desc="support@shohojworld.com"
          link="mailto:support@shohojworld.com"
          color="bg-purple-50"
        />
      </div>

      {/* FAQ Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 px-1">
          <BookOpen size={16} className="text-blue-600" />
          <h3 className="font-bold text-slate-800 text-sm">Frequently Asked Questions</h3>
        </div>
        
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm"
            >
              <h4 className="font-bold text-slate-800 text-sm mb-2">{faq.q}</h4>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">{faq.a}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Still need help? */}
      <div className="bg-slate-900 rounded-3xl p-8 text-center text-white shadow-xl shadow-slate-200">
        <div className="w-16 h-16 rounded-2xl bg-white/10 mx-auto flex items-center justify-center mb-4">
          <HelpCircle size={32} />
        </div>
        <h3 className="text-lg font-black mb-2 leading-none">Still Have Questions?</h3>
        <p className="text-xs text-slate-400 mb-6 font-medium">Our team is available 24/7 to help you with any issues.</p>
        <a 
          href="https://t.me/shohojworld_admin" 
          target="_blank" 
          rel="noreferrer"
          className="inline-flex items-center gap-2 bg-blue-600 text-white font-bold px-8 py-4 rounded-2xl text-xs hover:bg-blue-700 transition-colors"
        >
          Contact Admin Now
          <ExternalLink size={14} />
        </a>
      </div>
    </div>
  );
}

function ContactCard({ icon, title, desc, link, color }: { icon: any; title: string; desc: string; link: string; color: string }) {
  return (
    <a 
      href={link} 
      target="_blank" 
      rel="noreferrer"
      className="bg-white rounded-2xl p-4 flex items-center justify-between border border-slate-100 shadow-sm active:scale-[0.98] transition-transform"
    >
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center`}>
          {icon}
        </div>
        <div>
          <h4 className="font-bold text-slate-800 text-sm leading-none mb-1">{title}</h4>
          <p className="text-[10px] text-slate-400 font-medium">{desc}</p>
        </div>
      </div>
      <ExternalLink size={16} className="text-slate-200" />
    </a>
  );
}
