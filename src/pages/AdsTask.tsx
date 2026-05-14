import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, doc, updateDoc, increment, addDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { Task, UserProfile, AppSettings } from '../types';
import { PlayCircle, Clock, CheckCircle2, TrendingUp, RefreshCcw, ExternalLink } from 'lucide-react';
import { motion } from 'motion/react';
import toast from 'react-hot-toast';
import { cn } from '../lib/utils';

interface AdsTaskProps {
  profile: UserProfile | null;
}

export default function AdsTask({ profile }: AdsTaskProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [completedTaskIds, setCompletedTaskIds] = useState<Set<string>>(new Set());
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState<string | null>(null); // Task ID currently playing
  const [timeLeft, setTimeLeft] = useState(0);
  const [totalCompletedToday, setTotalCompletedToday] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      if (!profile) return;
      
      try {
        // Fetch Settings
        const settingsSnap = await getDoc(doc(db, 'settings', 'global'));
        if (settingsSnap.exists()) {
          setSettings(settingsSnap.data() as AppSettings);
        }

        // Fetch Tasks (both video and ad types)
        const q = query(
          collection(db, 'tasks'), 
          where('type', 'in', ['video', 'ad']), 
          where('isActive', '==', true)
        );
        const snap = await getDocs(q);
        const taskList = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task));
        setTasks(taskList);

        // Fetch completed tasks for today
        const today = new Set();
        const completedSnap = await getDocs(query(collection(db, 'userTasks'), where('userId', '==', profile.uid)));
        
        let countToday = 0;
        const now = new Date();
        now.setHours(0,0,0,0);

        completedSnap.docs.forEach(doc => {
          const data = doc.data();
          today.add(data.taskId);
          if (data.completedAt?.toDate() >= now) {
            countToday++;
          }
        });

        setCompletedTaskIds(today as Set<string>);
        setTotalCompletedToday(countToday);
      } catch (error) {
        console.error("Error fetching ads data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [profile]);

  const startTask = (task: Task) => {
    if (totalCompletedToday >= (settings?.adLimitDaily || 60)) {
      toast.error('Daily limit reached!');
      return;
    }

    if (task.url) {
      window.open(task.url, '_blank');
    }

    setPlaying(task.id);
    setTimeLeft(15); // 15 second delay/watch time

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          finishTask(task);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const finishTask = async (task: Task) => {
    if (!profile) return;
    
    try {
      const userRef = doc(db, 'users', profile.uid);
      
      // Add to userTasks
      await addDoc(collection(db, 'userTasks'), {
        userId: profile.uid,
        taskId: task.id,
        type: task.type,
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
      setTotalCompletedToday(prev => prev + 1);
      toast.success(`BDT ${task.reward.toFixed(2)} earned!`);
    } catch (error: any) {
      toast.error('Failed to update balance: ' + error.message);
    } finally {
      setPlaying(null);
    }
  };

  if (loading) {
    return <div className="flex justify-center p-12"><RefreshCcw className="animate-spin text-blue-500" /></div>;
  }

  return (
    <div className="space-y-6 pb-20">
      <div className="px-1">
        <h2 className="text-xl font-black text-slate-800">Video & Ads Tasks</h2>
        <p className="text-xs text-slate-400 font-medium mt-1">Complete tasks to earn real money</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <OverviewItem 
          label="Daily Tasks Completed"
          value={totalCompletedToday.toString()}
          subValue={`Limit: ${settings?.adLimitDaily || 60} tasks/day`}
        />
        <OverviewItem 
          label="Hourly Tasks Limit"
          value={settings?.adLimitHourly.toString() || '20'}
          subValue="Remaining reset soon"
        />
        <OverviewItem 
          label="Total Tasks Available"
          value={tasks.length.toString()}
        />
        <OverviewItem 
          label="Total Earnings"
          value={`BDT ${profile?.totalEarned.toFixed(2)}`}
        />
      </div>

      {playing ? (
        <div className="bg-slate-900 rounded-3xl p-10 flex flex-col items-center justify-center space-y-6 aspect-video shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-blue-500/10 animate-pulse" />
          <div className="relative z-10 w-20 h-20 rounded-full border-4 border-blue-500 border-t-transparent animate-spin flex items-center justify-center">
             <span className="text-2xl font-black text-white animate-none tracking-tighter">{timeLeft}</span>
          </div>
          <div className="text-center relative z-10">
            <h3 className="text-white font-bold mb-1 uppercase tracking-widest text-xs">Watching Content...</h3>
            <p className="text-slate-400 text-[10px] font-medium">Do not close this page to get your reward</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {tasks.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 text-center border border-slate-100 shadow-sm flex flex-col items-center">
              <PlayCircle className="text-slate-100 mb-4" size={48} />
              <p className="text-slate-400 font-bold text-sm">No video tasks available right now.</p>
            </div>
          ) : (
            tasks.map((task) => {
              const isCompleted = completedTaskIds.has(task.id);
              return (
                <motion.div 
                  key={task.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm relative overflow-hidden flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-sm",
                      task.type === 'video' ? "bg-red-500" : "bg-purple-500"
                    )}>
                      <PlayCircle size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 text-sm mb-0.5">{task.title}</h3>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-orange-500">BDT {task.reward.toFixed(2)}</span>
                        <span className="text-[10px] text-slate-300">•</span>
                        <span className="text-[10px] text-slate-400 font-medium capitalize">{task.type} Task</span>
                      </div>
                    </div>
                  </div>

                  <button 
                    disabled={isCompleted}
                    onClick={() => startTask(task)}
                    className={cn(
                      "px-5 py-2.5 rounded-xl font-bold text-xs transition-all active:scale-[0.95]",
                      isCompleted 
                        ? "bg-green-50 text-green-500 border border-green-100" 
                        : "bg-slate-900 text-white shadow-lg shadow-slate-200"
                    )}
                  >
                    {isCompleted ? (
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 size={12} />
                        Done
                      </div>
                    ) : (
                      'Start Task'
                    )}
                  </button>
                </motion.div>
              );
            })
          )}
        </div>
      )}

      {/* Bonus Card */}
      <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-6 text-white shadow-xl shadow-indigo-100 relative overflow-hidden">
        <div className="absolute right-[-10%] top-[-20%] w-40 h-40 bg-white/10 rounded-full blur-3xl" />
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
            <TrendingUp size={24} />
          </div>
          <div>
            <h4 className="font-black text-sm uppercase tracking-wider mb-1">Elite Bonus</h4>
            <p className="text-[11px] text-white/80 font-medium leading-tight">Complete {settings?.adLimitDaily || 60} tasks today to unlock the BDT 10.00 elite bonus!</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function OverviewItem({ label, value, subValue }: { label: string; value: string; subValue?: string }) {
  return (
    <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm">
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight mb-2">{label}</p>
      <p className="text-xl font-black text-slate-800 mb-1 tracking-tight">{value}</p>
      {subValue && <p className="text-[9px] font-medium text-slate-300">{subValue}</p>}
    </div>
  );
}
