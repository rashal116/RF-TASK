import React, { useState, useEffect, ReactNode } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { Task } from '../types';
import { Plus, Trash2, Edit2, Send, PlayCircle, Eye, EyeOff, Save, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '../lib/utils';

export default function AdminTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newTask, setNewTask] = useState<Partial<Task>>({
    title: '',
    description: '',
    reward: 0,
    type: 'telegram',
    isActive: true,
    url: ''
  });

  useEffect(() => {
    const fetchTasks = async () => {
      const q = query(collection(db, 'tasks'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      setTasks(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task)));
      setLoading(false);
    };
    fetchTasks();
  }, []);

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const docRef = await addDoc(collection(db, 'tasks'), {
        ...newTask,
        createdAt: new Date().toISOString()
      });
      setTasks(prev => [{ id: docRef.id, ...newTask, createdAt: new Date().toISOString() } as Task, ...prev]);
      setIsAdding(false);
      setNewTask({ title: '', description: '', reward: 0, type: 'telegram', isActive: true, url: '' });
      toast.success('Task added successfully!');
    } catch (error: any) {
      toast.error('Failed to add task: ' + error.message);
    }
  };

  const toggleStatus = async (task: Task) => {
    try {
      await updateDoc(doc(db, 'tasks', task.id), { isActive: !task.isActive });
      setTasks(prev => prev.map(t => t.id === task.id ? { ...t, isActive: !t.isActive } : t));
      toast.success('Status updated');
    } catch (error: any) {
      toast.error('Failed to update status: ' + error.message);
    }
  };

  const handleDelete = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    try {
      await deleteDoc(doc(db, 'tasks', taskId));
      setTasks(prev => prev.filter(t => t.id !== taskId));
      toast.success('Task deleted');
    } catch (error: any) {
      toast.error('Failed to delete: ' + error.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Manage Tasks</h1>
          <p className="text-xs text-slate-400 font-medium">Create and manage ads or telegram tasks</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="bg-blue-600 text-white font-bold px-6 py-3 rounded-2xl shadow-lg shadow-blue-100 flex items-center gap-2 hover:bg-blue-700 transition-colors"
        >
          <Plus size={18} />
          Create Task
        </button>
      </div>

      {isAdding && (
        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xl relative overflow-hidden animate-in fade-in slide-in-from-top-4">
           {/* Form Header */}
           <div className="flex items-center justify-between mb-8">
             <h3 className="text-lg font-black text-slate-800">New Task Details</h3>
             <button onClick={() => setIsAdding(false)} className="p-2 text-slate-400 hover:bg-slate-50 rounded-lg">
               <X size={20} />
             </button>
           </div>

           <form onSubmit={handleAddTask} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Task Title</label>
                  <input 
                    required
                    type="text" 
                    value={newTask.title}
                    onChange={e => setNewTask({...newTask, title: e.target.value})}
                    placeholder="e.g. Join Shohoj World Group"
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 text-sm font-medium focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Reward (BDT)</label>
                  <input 
                    required
                    type="number" 
                    step="0.01"
                    value={newTask.reward}
                    onChange={e => setNewTask({...newTask, reward: parseFloat(e.target.value)})}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 text-sm font-medium focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-4">
                 <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Task Type</label>
                  <select 
                    value={newTask.type}
                    onChange={e => setNewTask({...newTask, type: e.target.value as any})}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 text-sm font-medium focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  >
                    <option value="telegram">Telegram</option>
                    <option value="video">Video Task</option>
                    <option value="ad">General Ad</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Target URL</label>
                  <input 
                    type="text" 
                    value={newTask.url}
                    onChange={e => setNewTask({...newTask, url: e.target.value})}
                    placeholder="e.g. https://t.me/example"
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 text-sm font-medium focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Description (Optional)</label>
                <textarea 
                   value={newTask.description}
                   onChange={e => setNewTask({...newTask, description: e.target.value})}
                   className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 text-sm font-medium focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all h-24"
                />
              </div>

              <div className="md:col-span-2 flex justify-end gap-4 mt-4">
                 <button 
                  type="button"
                  onClick={() => setIsAdding(false)} 
                  className="px-8 py-3 rounded-xl text-sm font-bold text-slate-400 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="bg-blue-600 text-white font-bold px-10 py-3 rounded-xl shadow-lg shadow-blue-100 flex items-center gap-2 hover:bg-blue-700 transition-colors"
                >
                  <Save size={18} />
                  Save Task
                </button>
              </div>
           </form>
        </div>
      )}

      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Type & Title</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Reward</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={4} className="px-6 py-10 text-center text-slate-400 font-bold italic">Loading tasks...</td></tr>
              ) : tasks.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-10 text-center text-slate-400 font-bold italic">No tasks created yet</td></tr>
              ) : tasks.map((task) => (
                <tr key={task.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-xs shadow-sm",
                        task.type === 'telegram' ? "bg-blue-500" : 
                        task.type === 'video' ? "bg-red-500" : "bg-purple-500"
                      )}>
                        {task.type === 'telegram' ? <Send size={18} /> : 
                         task.type === 'video' ? <PlayCircle size={18} /> : <PlayCircle size={18} />}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800 mb-0.5">{task.title}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{task.type}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-black text-blue-600 text-sm">BDT{task.reward.toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter",
                      task.isActive ? "bg-green-50 text-green-600" : "bg-slate-100 text-slate-400"
                    )}>
                      {task.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                         onClick={() => toggleStatus(task)}
                         className={cn(
                           "p-2 rounded-xl border transition-all",
                           task.isActive ? "text-slate-400 border-slate-100 hover:text-slate-600" : "text-green-500 border-green-50 hover:bg-green-50"
                         )}
                      >
                        {task.isActive ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                      <button 
                        onClick={() => handleDelete(task.id)}
                        className="p-2 rounded-xl border border-red-50 text-red-400 hover:bg-red-50 transition-all font-bold"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
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
