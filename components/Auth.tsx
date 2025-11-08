import React, { useState, useContext } from 'react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, increment, arrayUnion } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';
import { User, Mission } from '../types';
import { UserContext } from '../App';
import { FacebookIcon, YoutubeIcon, TwitterIcon } from './IconComponents';

// Copied from App.tsx to be self-contained
const initialGlobalMissions: Mission[] = [
    { id: 'm1', type: 'watch', category: 'daily', title: 'Daily Starter', description: 'আজ 5টি ওয়েবসাইট ভিজিট করুন', reward: 5, goal: 5, progress: 0, completed: false },
    { id: 'm2', type: 'watch', category: 'daily', title: 'Welcome Bonus', description: 'আপনার প্রথম ওয়েবসাইটটি ভিজিট করুন', reward: 10, goal: 1, progress: 0, completed: false },
    { id: 's1', type: 'social', category: 'social', title: 'Follow on Facebook', description: 'আমাদের ফেসবুক পেজ ফলো করুন', reward: 15, goal: 1, progress: 0, completed: false, icon: FacebookIcon, link: 'https://www.facebook.com/profile.php?id=61583489671081' },
    { id: 's2', type: 'social', category: 'social', title: 'Subscribe to YouTube', description: 'আমাদের ইউটিউব চ্যানেল সাবস্ক্রাইব করুন', reward: 15, goal: 1, progress: 0, completed: false, icon: YoutubeIcon, link: 'https://youtube.com/@clickmint_93?si=9n8g82KWq6HhxsM0' },
    { id: 's3', type: 'social', category: 'social', title: 'Follow on X', description: 'X (Twitter) এ আমাদের ফলো করুন', reward: 10, goal: 1, progress: 0, completed: false, icon: TwitterIcon, link: 'https://x.com' },
];

const Auth: React.FC = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [referralCode, setReferralCode] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const context = useContext(UserContext);

    const handleAuthAction = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isLogin) {
                await signInWithEmailAndPassword(auth, email, password);
            } else {
                if (name.trim().length < 3) {
                    throw new Error('অনুগ্রহ করে কমপক্ষে ৩ অক্ষরের একটি নাম দিন।');
                }
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                const firebaseUser = userCredential.user;

                const now = new Date().toISOString();
                const referrerId = referralCode.trim();
                
                const newUser: User = {
                    id: firebaseUser.uid,
                    email: firebaseUser.email!,
                    name: name.trim(),
                    balance: referrerId ? 5.00 : 0.00, // Welcome bonus if referred
                    lastLogin: now,
                    loginStreak: 1,
                    totalSitesVisited: 0,
                    joinedDate: now,
                    missionEarnings: 0,
                    lastMissionReset: now,
                    referrals: { count: 0, earnings: 0, referredUsers: [] },
                    missions: JSON.parse(JSON.stringify(initialGlobalMissions)),
                    watchedAdIdsToday: [],
                    adCooldownEndTime: '',
                    fcmTokens: [],
                    notificationsEnabled: true,
                    ...(referrerId && { referredBy: referrerId }),
                };
                await setDoc(doc(db, 'users', firebaseUser.uid), newUser);

                if (referrerId) {
                    const referrerRef = doc(db, 'users', referrerId);
                    const referrerDoc = await getDoc(referrerRef);

                    if (referrerDoc.exists()) {
                        const referrerData = referrerDoc.data() as User;
                        // Give bonus to referrer
                        const updates = {
                            balance: increment(5),
                            'referrals.count': increment(1),
                            'referrals.earnings': increment(5),
                            'referrals.referredUsers': arrayUnion({
                                name: newUser.name,
                                date: new Date().toISOString(),
                                status: 'active' as const
                            })
                        };
                        await updateDoc(referrerRef, updates);

                        // Create transactions for both users
                        await context?.addTransaction({
                            userId: referrerId,
                            userName: referrerData.name,
                            type: 'referral',
                            amount: 5,
                            status: 'completed',
                            description: `রেফারেল বোনাস: ${newUser.name} যোগ দিয়েছেন`
                        });
                        await context?.addTransaction({
                            userId: newUser.id,
                            userName: newUser.name,
                            type: 'bonus',
                            amount: 5,
                            status: 'completed',
                            description: `স্বাগতম বোনাস! বন্ধুর আমন্ত্রণে যোগ দিয়েছেন।`
                        });
                        sessionStorage.setItem('showReferralBonus', 'true');
                    }
                }
            }
        } catch (err: any) {
            let friendlyMessage = 'কিছু একটা সমস্যা হয়েছে। আবার চেষ্টা করুন।';
            if (err.code) {
                switch (err.code) {
                    case 'auth/user-not-found':
                    case 'auth/wrong-password':
                    case 'auth/invalid-credential':
                        friendlyMessage = 'ভুল ইমেইল অথবা পাসওয়ার্ড।';
                        break;
                    case 'auth/email-already-in-use':
                        friendlyMessage = 'এই ইমেইলটি ইতিমধ্যে রেজিস্টার করা আছে। অনুগ্রহ করে লগইন করুন।';
                        break;
                    case 'auth/weak-password':
                        friendlyMessage = 'পাসওয়ার্ডটি কমপক্ষে ৬ অক্ষরের হতে হবে।';
                        break;
                    case 'auth/invalid-email':
                        friendlyMessage = 'অনুগ্রহ করে একটি বৈধ ইমেইল ঠিকানা দিন।';
                        break;
                    default:
                        friendlyMessage = err.message;
                        break;
                }
            } else {
                 friendlyMessage = err.message;
            }
            setError(friendlyMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col justify-center p-6 bg-background">
            <div className="text-center mb-10 animate-fadeIn">
                <h1 className="text-3xl font-bold text-primary">{isLogin ? 'স্বাগতম!' : 'একাউন্ট তৈরি করুন'}</h1>
                <p className="text-textSecondary mt-2">
                    {isLogin ? 'আপনার ইমেইল ও পাসওয়ার্ড দিয়ে লগইন করুন।' : 'ClickMint-এ যোগ দিন এবং উপার্জন শুরু করুন!'}
                </p>
            </div>
            
            <form onSubmit={handleAuthAction} className="space-y-4">
                {!isLogin && (
                     <div className="animate-fadeIn" style={{ animationDelay: '200ms' }}>
                        <label htmlFor="name" className="block text-sm font-medium text-textPrimary mb-1">আপনার নাম</label>
                        <input
                            type="text" id="name" value={name} onChange={(e) => setName(e.target.value)}
                            className="mt-1 block w-full px-4 py-3 bg-surface-light border border-slate-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-textPrimary"
                            placeholder="আপনার পুরো নাম লিখুন" required
                        />
                    </div>
                )}
                <div className="animate-fadeIn" style={{ animationDelay: isLogin ? '200ms' : '300ms' }}>
                    <label htmlFor="email" className="block text-sm font-medium text-textPrimary mb-1">ইমেইল</label>
                    <input
                        type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)}
                        className="mt-1 block w-full px-4 py-3 bg-surface-light border border-slate-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-textPrimary"
                        placeholder="you@example.com" required
                    />
                </div>
                 <div className="animate-fadeIn" style={{ animationDelay: isLogin ? '300ms' : '400ms' }}>
                    <label htmlFor="password" className="block text-sm font-medium text-textPrimary mb-1">পাসওয়ার্ড</label>
                    <input
                        type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)}
                        className="mt-1 block w-full px-4 py-3 bg-surface-light border border-slate-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-textPrimary"
                        placeholder="******" required
                    />
                </div>
                 {!isLogin && (
                     <div className="animate-fadeIn" style={{ animationDelay: '500ms' }}>
                        <label htmlFor="referral" className="block text-sm font-medium text-textPrimary mb-1">রেফারেল কোড (ঐচ্ছিক)</label>
                        <input
                            type="text" id="referral" value={referralCode} onChange={(e) => setReferralCode(e.target.value)}
                            className="mt-1 block w-full px-4 py-3 bg-surface-light border border-slate-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-textPrimary"
                            placeholder="বন্ধুর রেফারেল কোড দিন"
                        />
                    </div>
                )}
                 {error && <p className="text-red-500 text-sm text-center animate-fadeIn">{error}</p>}
                <div className="animate-fadeIn" style={{ animationDelay: isLogin ? '400ms' : '600ms' }}>
                    <button
                        type="submit" disabled={loading}
                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-3d text-sm font-medium text-white bg-primary hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:bg-slate-500 disabled:cursor-not-allowed transition-all"
                    >
                        {loading ? 'প্রসেসিং...' : (isLogin ? 'লগইন করুন' : 'রেজিস্টার করুন')}
                    </button>
                </div>
            </form>
            <p className="text-center text-sm text-textSecondary mt-6">
                {isLogin ? "একাউন্ট নেই?" : "ইতিমধ্যে একাউন্ট আছে?"}
                <button onClick={() => { setIsLogin(!isLogin); setError(''); }} className="font-medium text-primary hover:underline ml-2">
                    {isLogin ? 'রেজিস্টার করুন' : 'লগইন করুন'}
                </button>
            </p>
        </div>
    );
};

export default Auth;