import React from 'react';

export interface ReferredUser {
  name: string;
  date: string;
  status: 'active' | 'pending';
}

export interface User {
  id: string; // Firebase Auth UID
  email: string;
  name:string;
  balance: number;
  lastLogin: string;
  loginStreak: number;
  totalAdsWatched: number;
  joinedDate: string;
  missionEarnings: number;
  lastMissionReset: string;
  referrals: {
    count: number;
    earnings: number;
    referredUsers: ReferredUser[];
  };
  missions: Mission[];
  isBlocked?: boolean;
  referredBy?: string;
}

export interface Ad {
  id: string;
  type: 'video' | 'site';
  brand: string;
  title: string;
  reward: number;
  duration: number; // in seconds
  url: string; 
}

export interface Transaction {
  id: string;
  userId: string;
  userName: string;
  type: 'earn' | 'withdraw' | 'bonus' | 'referral' | 'daily-bonus' | 'admin-adjustment';
  amount: number;
  date: string;
  status: 'completed' | 'pending' | 'failed';
  description: string;
}

export type View = 
  | 'splash' 
  | 'onboarding' 
  | 'auth'
  | 'dashboard' 
  | 'withdraw' 
  | 'history' 
  | 'refer' 
  | 'faq'
  | 'missions'
  | 'profile'
  | 'admin';

export interface Mission {
    id: string;
    type: 'watch' | 'social';
    category: 'daily' | 'social';
    title: string;
    description: string;
    reward: number;
    goal: number;
    progress: number;
    completed: boolean;
    icon?: React.ComponentType<{ className?: string }>;
    link?: string;
}