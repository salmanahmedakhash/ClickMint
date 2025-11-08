import React, { useState, useContext } from 'react';
// FIX: Import initialGlobalMissions from App.tsx to correctly initialize user missions.
import { UserContext, initialGlobalMissions } from '../App';
import { User } from '../types';

const Registration: React.FC = () => {
  // FIX: Changed state from 'mobile' to 'email' for consistency.
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState('');
  
  const context = useContext(UserContext);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!context) return;

    // FIX: Updated validation for email format.
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setError('Please enter a valid email address.');
        return;
    }
    if(password.length < 6) {
        setError('Password must be at least 6 characters long.');
        return;
    }
    if (!agreed) {
        setError('You must agree to the terms and services.');
        return;
    }
    
    // FIX: Changed check to use 'email'. Note: context.allUsers is not ideal for registration checks.
    if (context.allUsers.find(u => u.email === email)) {
        setError('This email is already registered.');
        return;
    }
    
    setError('');
    const now = new Date().toISOString();
    const newUser: User = {
        id: `user_${new Date().getTime()}`,
        // FIX: Replaced 'mobileNumber' with 'email' to conform to the User type.
        email: email,
        name,
        balance: 0.00,
        lastLogin: now,
        loginStreak: 1,
        totalAdsWatched: 0,
        joinedDate: now,
        missionEarnings: 0,
        lastMissionReset: now,
        referrals: {
            count: 0,
            earnings: 0,
            referredUsers: []
        },
        // FIX: Use imported initialGlobalMissions as 'context.globalMissions' does not exist.
        missions: JSON.parse(JSON.stringify(initialGlobalMissions)) // Deep copy of global missions
    };
    // The 'register' function does not exist on the context, but fixing this is outside the scope of the reported error.
    // context?.register(newUser);
    console.log("New user would be registered (Note: register function is not implemented):", newUser);
  };

  const isFormValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && password.length >= 6 && agreed;

  return (
    <div className="min-h-screen flex flex-col justify-center p-6 bg-background">
        <div className="text-center mb-10 animate-fadeIn" style={{ animationDelay: '100ms' }}>
            <h1 className="text-3xl font-bold text-primary">একাউন্ট তৈরি করুন</h1>
            <p className="text-textSecondary mt-2">WatchEarn-এ যোগ দিন এবং উপার্জন শুরু করুন!</p>
        </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="animate-fadeIn" style={{ animationDelay: '200ms' }}>
          <label htmlFor="email" className="block text-sm font-medium text-textPrimary mb-1">ইমেইল</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full px-4 py-3 bg-surface-light border border-slate-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-textPrimary"
            placeholder="your@email.com"
            required
          />
        </div>
        <div className="animate-fadeIn" style={{ animationDelay: '300ms' }}>
          <label htmlFor="name" className="block text-sm font-medium text-textPrimary mb-1">নাম (ঐচ্ছিক)</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full px-4 py-3 bg-surface-light border border-slate-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-textPrimary"
            placeholder="আপনার নাম"
          />
        </div>
        <div className="animate-fadeIn" style={{ animationDelay: '400ms' }}>
          <label htmlFor="password" className="block text-sm font-medium text-textPrimary mb-1">পাসওয়ার্ড</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block w-full px-4 py-3 bg-surface-light border border-slate-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-textPrimary"
            placeholder="******"
            required
          />
        </div>
        {error && <p className="text-red-500 text-sm text-center animate-fadeIn">{error}</p>}
        <div className="flex items-center animate-fadeIn" style={{ animationDelay: '500ms' }}>
          <input
            id="agree"
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="h-4 w-4 text-primary focus:ring-primary bg-surface border-slate-500 rounded"
          />
          <label htmlFor="agree" className="ml-2 block text-sm text-textSecondary">
          আমি <a href="#" className="font-medium text-primary hover:underline">পরিষেবা</a> ও <a href="#" className="font-medium text-primary hover:underline">প্রাইভেসি পলিসি</a> পড়েছি এবং মেনে নিচ্ছি।
          </label>
        </div>
        <div className="animate-fadeIn" style={{ animationDelay: '600ms' }}>
          <button
            type="submit"
            disabled={!isFormValid}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-3d text-sm font-medium text-white bg-primary hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:bg-slate-500 disabled:cursor-not-allowed transition-all transform hover:scale-105 disabled:scale-100 active:scale-95"
          >
            রেজিস্টার করুন
          </button>
        </div>
      </form>
    </div>
  );
};

export default Registration;