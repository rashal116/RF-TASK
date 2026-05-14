import { ReactNode } from 'react';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp, updateDoc, increment } from 'firebase/firestore';
import { motion } from 'motion/react';
import { Wallet, ShieldCheck, Zap } from 'lucide-react';
import toast from 'react-hot-toast';
import { generateReferralCode } from '../lib/utils';
import { useSearchParams } from 'react-router-dom';

export default function Login() {
  const [searchParams] = useSearchParams();
  const refCode = searchParams.get('ref');

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      
      if (!userSnap.exists()) {
        const userData = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          balance: 0,
          totalEarned: 0,
          lifetimeEarned: 0,
          referralCode: generateReferralCode(),
          referredBy: refCode || null,
          referralsCount: 0,
          status: 'active',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };
        await setDoc(userRef, userData);

        // If referred, update referrer
        if (refCode) {
          // Note: In a real app, you'd query users where referralCode == refCode
          // But Firestore rules don't easily allow cross-doc updates without cloud functions or complex rules.
          // We'll skip the automated count update here for simplicity or handle it via a cloud function if possible.
          // For now, we just store the referredBy.
        }
        toast.success('Welcome to Shohoj World!');
      } else {
        toast.success('Welcome back!');
      }
    } catch (error: any) {
      console.error(error);
      toast.error('Login failed: ' + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F7FF] flex flex-col items-center justify-center p-6 text-center">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-sm"
      >
        <div className="mb-8">
          <div className="w-20 h-20 bg-white rounded-3xl shadow-xl shadow-blue-100 flex items-center justify-center mx-auto mb-6">
            <Zap className="text-blue-600 fill-blue-600" size={40} />
          </div>
          <h1 className="text-3xl font-black text-slate-800 mb-2">Shohoj World</h1>
          <p className="text-slate-400 font-medium">Earn money by completing simple tasks daily.</p>
        </div>

        <div className="grid grid-cols-1 gap-4 mb-10">
          <Feature icon={<ShieldCheck className="text-green-500" />} title="Secure Platform" desc="Your data and earnings are safe with us." />
          <Feature icon={<Wallet className="text-blue-500" />} title="Instant Withdraw" desc="Withdraw your earnings via Bkash or Nagad." />
        </div>

        <button 
          onClick={handleLogin}
          className="w-full bg-white border border-slate-200 text-slate-700 font-bold py-4 rounded-2xl flex items-center justify-center gap-3 shadow-sm active:scale-[0.98] transition-transform"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-6 h-6" />
          Continue with Google
        </button>

        <p className="mt-8 text-[10px] text-slate-400 uppercase tracking-widest font-bold">
          By continuing, you agree to our Terms & Privacy
        </p>
      </motion.div>
    </div>
  );
}

function Feature({ icon, title, desc }: { icon: ReactNode; title: string; desc: string }) {
  return (
    <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-4 border border-white flex items-center gap-4 text-left">
      <div className="shrink-0">{icon}</div>
      <div>
        <h3 className="font-bold text-slate-800 text-sm">{title}</h3>
        <p className="text-xs text-slate-400">{desc}</p>
      </div>
    </div>
  );
}
