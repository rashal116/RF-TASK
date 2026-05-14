import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, doc, updateDoc, increment, addDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { Task, UserProfile } from '../types';
import { Send, CheckCircle, RefreshCcw, ExternalLink } from 'lucide-react';
import { motion } from 'motion/react';
import toast from 'react-hot-toast';
import { cn } from '../lib/utils';

interface TgTasksProps {
  profile: UserProfile | null;
}

export default function TgTasks({ profile }: TgTasksProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [completedTaskIds, setCompletedTaskIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState<string | null>(null);

  useEffect(() => {
    const fetchTasks = async () => {
      if (!profile) return;
      
      const q = query(collection(db, 'tasks'), where('type', '==', 'telegram'), where('isActive', '==', true));
      const snap = await getDocs(q);
      const taskList = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task));
      setTasks(taskList);

      // Fetch completed tasks
      const completedSnap = await getDocs(query(collection(db, 'userTasks'), where('userId', '==', profile.uid)));
      const completedIds = new Set(completedSnap.docs.map(doc => doc.data().taskId));
      setCompletedTaskIds(completedIds);
      
      setLoading(false);
    };

    fetchTasks();
  }, [profile]);

  const handleJoin = (url: string) => {
    window.open(url, '_blank');
  };

  const handleVerify = async (task: Task) => {
    if (!profile) return;
    
    setVerifying(task.id);
    // In a real telegram bot integration, you'd check membership via API.
    // Here we simulate a 3-second "verification" delay.
    setTimeout(async () => {
      try {
        const userRef = doc(db, 'users', profile.uid);
        
        // Add to userTasks
        await addDoc(collection(db, 'userTasks'), {
          userId: profile.uid,
          taskId: task.id,
          type: 'telegram',
          reward: task.reward,
          completedAt: serverTimestamp()
        });

        // Update user balance
        await updateDoc(userRef, {
          balance: increment(task.reward),
          totalEarned: increment(task.reward),
          lifetimeEarned: increment(task.reward),
          updatedAt: serverTimestamp()
        });

        // Handle referral commission (10%)
        if (profile.referredBy) {
          // Query user by referralCode
          const referrersQuery = query(collection(db, 'users'), where('referralCode', '==', profile.referredBy));
          const referrersSnap = await getDocs(referrersQuery);
          if (!referrersSnap.empty) {
            const referrerDoc = referrersSnap.docs[0];
            const commission = task.reward * 0.1;
            await updateDoc(doc(db, 'users', referrerDoc.id), {
              balance: increment(commission),
              totalEarned: increment(commission),
              lifetimeEarned: increment(commission),
              updatedAt: serverTimestamp()
            });
          }
        }

        setCompletedTaskIds(prev => new Set([...prev, task.id]));
        toast.success(`Verified! BDT${task.reward} added to balance.`);
      } catch (error: any) {
        toast.error('Verification failed: ' + error.message);
      } finally {
        setVerifying(null);
      }
    }, 3000);
  };

  if (loading) {
    return <div className="flex justify-center p-12"><RefreshCcw className="animate-spin text-blue-500" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-xl font-black text-slate-800">Telegram Tasks</h2>
        <div className="bg-white px-3 py-1 rounded-full border border-slate-100 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400">Total: {tasks.length}</span>
        </div>
      </div>

      {tasks.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm flex flex-col items-center">
          <Send className="text-slate-100 mb-4" size={60} />
          <p className="text-slate-400 font-bold">No tasks available right now.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {tasks.map((task) => {
            const isCompleted = completedTaskIds.has(task.id);
            return (
              <motion.div 
                key={task.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm relative overflow-hidden"
              >
                {isCompleted && (
                  <div className="absolute top-2 right-2 flex items-center gap-1 bg-green-50 text-green-600 px-2 py-0.5 rounded-full text-[8px] font-black uppercase">
                    <CheckCircle size={10} />
                    Done
                  </div>
                )}

                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-slate-800 mb-0.5">{task.title}</h3>
                    <p className="text-[10px] text-slate-400 font-medium">{task.description || 'Join channel to earn'}</p>
                  </div>
                  <div className="bg-orange-50 text-orange-600 px-2 py-1 rounded-lg border border-orange-100 flex items-center gap-1.5 shadow-inner">
                    <div className="w-3 h-3 bg-orange-200 rounded-full flex items-center justify-center text-[8px] font-black italic">!</div>
                    <span className="text-[10px] font-black">{task.reward.toFixed(2)} BDT</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button 
                    disabled={isCompleted}
                    onClick={() => handleJoin(task.url || '#')}
                    className={cn(
                      "flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-xs transition-all active:scale-[0.98]",
                      isCompleted ? "bg-slate-50 text-slate-300" : "bg-blue-600 text-white shadow-lg shadow-blue-100"
                    )}
                  >
                    <ExternalLink size={14} />
                    Join
                  </button>
                  <button 
                    disabled={isCompleted || verifying === task.id}
                    onClick={() => handleVerify(task)}
                    className={cn(
                      "flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-xs transition-all active:scale-[0.98]",
                      isCompleted ? "bg-slate-50 text-slate-300" : "bg-slate-50 text-slate-400 border border-slate-100"
                    )}
                  >
                    {verifying === task.id ? (
                      <RefreshCcw size={14} className="animate-spin text-blue-500" />
                    ) : (
                      'Verify'
                    )}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
