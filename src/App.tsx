import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from './lib/firebase';
import { UserProfile } from './types';
import { Toaster } from 'react-hot-toast';
import { generateReferralCode } from './lib/utils';

// Pages
// ... (imports remain the same)
import Home from './pages/Home';
import AdsTask from './pages/AdsTask';
import TgTasks from './pages/TgTasks';
import Refer from './pages/Refer';
import Withdraw from './pages/Withdraw';
import Profile from './pages/Profile';
import Support from './pages/Support';
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import AdminWithdrawals from './pages/AdminWithdrawals';
import AdminSettings from './pages/AdminSettings';
import AdminTasks from './pages/AdminTasks';
import Login from './pages/Login';
import Layout from './components/Layout';
import AdminLayout from './components/AdminLayout';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        // Sync profile
        const userPath = `users/${user.uid}`;
        const userRef = doc(db, 'users', user.uid);
        
        try {
          const userSnap = await getDoc(userRef);
          
          if (!userSnap.exists()) {
            const newProfile: Partial<UserProfile> = {
              uid: user.uid,
              email: user.email || '',
              displayName: user.displayName || 'User',
              photoURL: user.photoURL || '',
              balance: 0,
              totalEarned: 0,
              lifetimeEarned: 0,
              referralCode: generateReferralCode(),
              referralsCount: 0,
              status: 'active',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            await setDoc(userRef, {
              ...newProfile,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            });
          }
        } catch (error) {
          handleFirestoreError(error, OperationType.WRITE, userPath);
        }

        // Real-time profile listener
        onSnapshot(userRef, (doc) => {
          if (doc.exists()) {
            setProfile(doc.data() as UserProfile);
          }
        }, (error) => {
          handleFirestoreError(error, OperationType.GET, userPath);
        });

        // Check if admin
        const adminPath = `admins/${user.uid}`;
        try {
          const adminRef = doc(db, 'admins', user.uid);
          const adminSnap = await getDoc(adminRef);
          setIsAdmin(adminSnap.exists() || user.email === 'rashaltechworld@gmail.com');
        } catch (error) {
          // If access denied, user is likely not an admin, which is handled by hardcoded check
          setIsAdmin(user.email === 'rashaltechworld@gmail.com');
          // We don't necessarily want to crash the whole app here if the user isn't an admin
          console.warn("Admin check failed or permission denied - user is not an admin.");
        }
      } else {
        setProfile(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <Router>
      <Toaster position="top-center" />
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
        
        {/* User Routes */}
        <Route element={user ? <Layout profile={profile} /> : <Navigate to="/login" />}>
          <Route path="/" element={<Home profile={profile} />} />
          <Route path="/ads" element={<AdsTask profile={profile} />} />
          <Route path="/telegram" element={<TgTasks profile={profile} />} />
          <Route path="/refer" element={<Refer profile={profile} />} />
          <Route path="/withdraw" element={<Withdraw profile={profile} />} />
          <Route path="/profile" element={<Profile profile={profile} />} />
          <Route path="/support" element={<Support />} />
        </Route>

        {/* Admin Routes */}
        <Route element={isAdmin ? <AdminLayout /> : <Navigate to="/" />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/withdrawals" element={<AdminWithdrawals />} />
          <Route path="/admin/settings" element={<AdminSettings />} />
          <Route path="/admin/tasks" element={<AdminTasks />} />
        </Route>

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}
