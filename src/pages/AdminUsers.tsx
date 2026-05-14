import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs, doc, updateDoc, query, orderBy } from 'firebase/firestore';
import { UserProfile } from '../types';
import { Search, UserMinus, UserCheck, Mail, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '../lib/utils';

export default function AdminUsers() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      setUsers(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as any)));
      setLoading(false);
    };
    fetchUsers();
  }, []);

  const toggleStatus = async (user: UserProfile) => {
    const newStatus = user.status === 'active' ? 'suspended' : 'active';
    try {
      await updateDoc(doc(db, 'users', user.uid), { status: newStatus });
      setUsers(prev => prev.map(u => u.uid === user.uid ? { ...u, status: newStatus } : u));
      toast.success(`User ${newStatus === 'active' ? 'activated' : 'suspended'}`);
    } catch (error: any) {
      toast.error('Failed to update status: ' + error.message);
    }
  };

  const filteredUsers = users.filter(u => 
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.displayName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Registered Users</h1>
          <p className="text-xs text-slate-400 font-medium">Manage user accounts and status</p>
        </div>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by name or email..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-white border border-slate-200 rounded-2xl py-3 pl-12 pr-6 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all w-full md:w-80"
          />
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">User</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Balance</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Referrals</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-10 text-center text-slate-400 font-bold">Loading users...</td></tr>
              ) : filteredUsers.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-10 text-center text-slate-400 font-bold">No users found</td></tr>
              ) : filteredUsers.map((user) => (
                <tr key={user.uid} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 overflow-hidden">
                        <img src={user.photoURL} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800 leading-none mb-1.5">{user.displayName}</p>
                        <p className="text-xs text-slate-400 font-medium">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-black text-blue-600 text-sm">BDT{user.balance.toFixed(2)}</td>
                  <td className="px-6 py-4 font-bold text-slate-600 text-sm">{user.referralsCount}</td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter",
                      user.status === 'active' ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
                    )}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => toggleStatus(user)}
                      className={cn(
                        "p-2 rounded-xl border transition-all",
                        user.status === 'active' ? "text-red-400 hover:bg-red-50 border-red-50" : "text-green-400 hover:bg-green-50 border-green-50"
                      )}
                    >
                      {user.status === 'active' ? <UserMinus size={18} /> : <UserCheck size={18} />}
                    </button>
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
