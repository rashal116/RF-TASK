import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs, doc, updateDoc, query, orderBy, increment } from 'firebase/firestore';
import { Withdrawal } from '../types';
import { Check, X, CreditCard, Clock, Filter, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '../lib/utils';

export default function AdminWithdrawals() {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  useEffect(() => {
    const fetchWithdrawals = async () => {
      const q = query(collection(db, 'withdrawals'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      setWithdrawals(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Withdrawal)));
      setLoading(false);
    };
    fetchWithdrawals();
  }, []);

  const handleUpdateStatus = async (withdrawal: Withdrawal, status: 'approved' | 'rejected') => {
    try {
      // 1. Update withdrawal status
      await updateDoc(doc(db, 'withdrawals', withdrawal.id), { 
        status, 
        updatedAt: new Date().toISOString() 
      });
      
      // 2. If approved, deduct from user balance
      if (status === 'approved') {
        const userRef = doc(db, 'users', withdrawal.userId);
        await updateDoc(userRef, {
          balance: increment(-withdrawal.amount)
        });
      }

      setWithdrawals(prev => prev.map(w => w.id === withdrawal.id ? { ...w, status } : w));
      toast.success(`Withdrawal ${status}`);
    } catch (error: any) {
      toast.error('Failed to update: ' + error.message);
    }
  };

  const filteredWithdrawals = filter === 'all' 
    ? withdrawals 
    : withdrawals.filter(w => w.status === filter);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Withdrawal Requests</h1>
          <p className="text-xs text-slate-400 font-medium">Review and process payout requests</p>
        </div>
        <div className="flex bg-white p-1 rounded-2xl border border-slate-200">
           {(['all', 'pending', 'approved', 'rejected'] as const).map((f) => (
             <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all",
                filter === f ? "bg-blue-600 text-white shadow-lg shadow-blue-100" : "text-slate-400 hover:text-slate-600"
              )}
             >
               {f}
             </button>
           ))}
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-sans">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">User & Method</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Address</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-10 text-center text-slate-400 font-bold italic">Loading requests...</td></tr>
              ) : filteredWithdrawals.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-10 text-center text-slate-400 font-bold italic">No requests match criteria</td></tr>
              ) : filteredWithdrawals.map((w) => (
                <tr key={w.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-xs shadow-sm",
                        w.method === 'Bkash' ? "bg-pink-600" : "bg-orange-600"
                      )}>
                        {w.method[0]}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800 mb-0.5">{w.userEmail}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{w.method}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                     <p className="text-sm font-black text-slate-800">BDT{w.amount.toFixed(2)}</p>
                  </td>
                  <td className="px-6 py-4">
                     <p className="text-xs font-mono text-slate-500 bg-slate-50 px-2 py-1 rounded inline-block border border-slate-100">{w.address}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter flex items-center w-fit gap-1",
                      w.status === 'approved' ? "bg-green-50 text-green-600" : 
                      w.status === 'pending' ? "bg-blue-50 text-blue-600" : "bg-red-50 text-red-600"
                    )}>
                      {w.status === 'pending' && <Clock size={10} />}
                      {w.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {w.status === 'pending' && (
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleUpdateStatus(w, 'approved')}
                          className="p-2 rounded-xl border border-green-100 text-green-500 hover:bg-green-50 transition-all font-bold group"
                          title="Approve"
                        >
                          <Check size={18} />
                        </button>
                        <button 
                          onClick={() => handleUpdateStatus(w, 'rejected')}
                          className="p-2 rounded-xl border border-red-100 text-red-400 hover:bg-red-50 transition-all font-bold group"
                          title="Reject"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
