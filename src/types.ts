export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  balance: number;
  totalEarned: number;
  lifetimeEarned: number;
  referralCode: string;
  referredBy?: string | null;
  referralsCount: number;
  status: 'active' | 'suspended';
  createdAt: string;
  updatedAt: string;
  completedTasks?: string[];
}

export interface Task {
  id: string;
  title: string;
  description: string;
  reward: number;
  type: 'ad' | 'telegram' | 'video';
  url?: string;
  isActive: boolean;
  createdAt: string;
}

export interface Withdrawal {
  id: string;
  userId: string;
  userEmail: string;
  amount: number;
  method: 'Bkash' | 'Nagad';
  address: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

export interface AppSettings {
  minWithdrawal: number;
  minReferralsForWithdraw: number;
  referralBonusPercent: number;
  adLimitHourly: number;
  adLimitDaily: number;
}
