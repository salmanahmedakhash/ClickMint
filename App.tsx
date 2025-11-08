import React, { useState, useEffect, createContext, useCallback, useMemo } from 'react';
import { User, Ad, Transaction, View, Mission } from './types';
import { auth, db } from './firebaseConfig';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, doc, getDoc, updateDoc, addDoc, getDocs, query, orderBy } from 'firebase/firestore';

import Onboarding from './components/Onboarding';
import Dashboard from './components/Dashboard';
import Withdraw from './components/Withdraw';
import History from './components/History';
import Refer from './components/Refer';
import FAQ from './components/FAQ';
import Missions from './components/Missions';
import Profile from './components/Profile';
import DailyBonusModal from './components/DailyBonusModal';
import ReferralBonusModal from './components/ReferralBonusModal';
import BottomNav from './components/BottomNav';
import AdminPanel from './components/AdminPanel';
import Auth from './components/Auth';
import LoadingSpinner from './components/LoadingSpinner';
import { PlayIcon, FacebookIcon, YoutubeIcon, TwitterIcon } from './components/IconComponents';

const isSameDay = (d1: Date, d2: Date) => {
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
}

const isYesterday = (d1: Date, d2: Date) => {
    const yesterday = new Date(d1);
    yesterday.setDate(d1.getDate() - 1);
    return isSameDay(yesterday, d2);
}

export const initialGlobalMissions: Mission[] = [
    { id: 'm1', type: 'watch', category: 'daily', title: 'Daily Starter', description: 'আজ 5টি ভিডিও দেখুন', reward: 5, goal: 5, progress: 0, completed: false },
    { id: 'm2', type: 'watch', category: 'daily', title: 'Welcome Bonus', description: 'আপনার প্রথম ভিডিওটি দেখুন', reward: 10, goal: 1, progress: 0, completed: false },
    { id: 's1', type: 'social', category: 'social', title: 'Follow on Facebook', description: 'আমাদের ফেসবুক পেজ ফলো করুন', reward: 15, goal: 1, progress: 0, completed: false, icon: FacebookIcon, link: 'https://facebook.com' },
    { id: 's2', type: 'social', category: 'social', title: 'Subscribe to YouTube', description: 'আমাদের ইউটিউব চ্যানেল সাবস্ক্রাইব করুন', reward: 15, goal: 1, progress: 0, completed: false, icon: YoutubeIcon, link: 'https://youtube.com' },
    { id: 's3', type: 'social', category: 'social', title: 'Follow on X', description: 'X (Twitter) এ আমাদের ফলো করুন', reward: 10, goal: 1, progress: 0, completed: false, icon: TwitterIcon, link: 'https://x.com' },
];

export const UserContext = createContext<{
    currentUser: User | null;
    loading: boolean;
    setView: (view: View) => Promise<void>;
    logout: () => Promise<void>;
    updateUser: (userId: string, updates: Partial<User>) => Promise<void>;
    addTransaction: (transactionData: Omit<Transaction, 'id' | 'date'>) => Promise<void>;
    updateBalance: (userId: string, amount: number, type: Transaction['type'], description: string) => Promise<void>;
    updateMissionProgress: (userId: string, missionId: string, progressToAdd: number) => Promise<void>;
    completeMission: (userId: string, missionId: string) => Promise<void>;
    hasCompletableMissions: boolean;
    // Admin specific
    allUsers: User[];
    allTransactions: Transaction[];
    fetchAllUsers: () => Promise<void>;
    fetchAllTransactions: () => Promise<void>;
    toggleUserBlock: (userId: string) => Promise<void>;
    processWithdrawal: (transactionId: string, approved: boolean) => Promise<void>;
} | null>(null);

const adsData: Ad[] = Array.from({ length: 15 }, (_, i) => {
    const isVideo = i % 2 === 0; // Mix of video and site ads
    return {
        id: `ad${i + 1}`,
        type: isVideo ? 'video' : 'site',
        brand: `Brand ${String.fromCharCode(65 + (i % 10))}${Math.floor(i/10) + 1}`,
        title: isVideo ? `Product Demo #${i + 1}` : `Visit Website #${i + 1}`,
        reward: parseFloat((1.00 + Math.random()).toFixed(2)), // 1.00 to 2.00
        duration: 25 + Math.floor(Math.random() * 26), // 25 to 50 seconds
        url: isVideo ? 'placeholder' : 'https://google.com',
    };
});

const SplashScreen: React.FC = () => (
    <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-premium-light to-premium-dark text-white">
        <div className="animate-float">
            <PlayIcon className="w-24 h-24 mb-4 text-white" />
        </div>
        <h1 className="text-4xl font-bold">WatchEarn</h1>
        <p className="mt-2 text-lg">দেখুন, রোজ আয় করুন!</p>
    </div>
);

const App: React.FC = () => {
    const [view, setView] = useState<View>('splash');
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [bonusInfo, setBonusInfo] = useState<{ amount: number; streak: number } | null>(null);
    const [showReferralBonus, setShowReferralBonus] = useState(false);
    
    // Admin state
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);

    useEffect(() => {
        // Capture referral ID from URL on initial load
        const urlParams = new URLSearchParams(window.location.search);
        const referrerId = urlParams.get('ref');
        if (referrerId) {
            sessionStorage.setItem('referrerId', referrerId);
            // Clean the URL to prevent re-using the same link
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }, []);

    const fetchUser = useCallback(async (uid: string) => {
        const userDocRef = doc(db, 'users', uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
            const userData = userDoc.data() as User;
            setCurrentUser(userData);

            // Check if we need to show the referral bonus modal
            if (sessionStorage.getItem('showReferralBonus') === 'true') {
                setShowReferralBonus(true);
                sessionStorage.removeItem('showReferralBonus');
            }
            return userData;
        } else {
            await signOut(auth);
            setView('auth'); 
            return null;
        }
    }, []);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user && user.uid) {
                const userData = await fetchUser(user.uid);
                if (userData) { 
                     setView('dashboard');
                }
            } else {
                const splashTimer = setTimeout(() => {
                    setView('onboarding');
                }, 2000);
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, [fetchUser]);

    const setViewAsync = async (v: View) => setView(v);

    const logout = async () => {
        await signOut(auth);
        setCurrentUser(null);
        setView('onboarding');
    };

    const updateUser = useCallback(async (userId: string, updates: Partial<User>) => {
        const userDocRef = doc(db, 'users', userId);
        await updateDoc(userDocRef, updates);
        if (userId === currentUser?.id) {
            setCurrentUser(prev => prev ? { ...prev, ...updates } : null);
        }
    }, [currentUser?.id]);
    
    const addTransaction = useCallback(async (transactionData: Omit<Transaction, 'id' | 'date'>) => {
        const newTransaction = {
            ...transactionData,
            date: new Date().toISOString()
        };
        await addDoc(collection(db, 'transactions'), newTransaction);
    }, []);

    const updateBalance = useCallback(async (userId: string, amount: number, type: Transaction['type'], description: string) => {
        const userRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userRef);
        if (!userDoc.exists()) return;

        const user = userDoc.data() as User;
        const newBalance = parseFloat((user.balance + amount).toFixed(2));
        
        await updateUser(userId, { balance: newBalance });

        await addTransaction({
            userId,
            userName: user.name,
            type,
            amount,
            status: 'completed',
            description,
        });
    }, [updateUser, addTransaction]);

    const updateMissionProgress = useCallback(async (userId: string, missionId: string, progressToAdd: number) => {
        const userRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userRef);
        if (!userDoc.exists()) return;
        const user = userDoc.data() as User;

        const newMissions = user.missions.map(mission => {
            if (mission.id === missionId && !mission.completed) {
                return { ...mission, progress: Math.min(mission.progress + progressToAdd, mission.goal) };
            }
            return mission;
        });
        await updateUser(userId, { missions: newMissions });
    }, [updateUser]);

    const completeMission = useCallback(async (userId: string, missionId: string) => {
        const userRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userRef);
        if (!userDoc.exists()) return;
        const user = userDoc.data() as User;

        const mission = user.missions.find(m => m.id === missionId);
        if (mission && !mission.completed && (mission.progress >= mission.goal || mission.type === 'social')) {
            await updateBalance(userId, mission.reward, 'bonus', `Mission: ${mission.title}`);
            const newMissions = user.missions.map(m => m.id === missionId ? { ...m, completed: true, progress: m.goal } : m);
            const newMissionEarnings = user.missionEarnings + mission.reward;
            await updateUser(userId, { missions: newMissions, missionEarnings: newMissionEarnings });
        }
    }, [updateBalance, updateUser]);

    useEffect(() => {
        const checkDailyBonusAndMissions = async () => {
            if (currentUser && view === 'dashboard') {
                const today = new Date();
                const lastLoginDate = new Date(currentUser.lastLogin);
                
                if (!isSameDay(today, lastLoginDate)) {
                    const newStreak = isYesterday(today, lastLoginDate) ? currentUser.loginStreak + 1 : 1;
                    const bonusAmount = 2.5 + (newStreak * 0.5);
                    
                    await updateBalance(currentUser.id, bonusAmount, 'daily-bonus', `Daily Bonus - Day ${newStreak}`);
                    await updateUser(currentUser.id, { loginStreak: newStreak, lastLogin: today.toISOString() });

                    setTimeout(() => setBonusInfo({ amount: bonusAmount, streak: newStreak }), 500);
                }

                const lastResetDate = new Date(currentUser.lastMissionReset);
                if (!isSameDay(today, lastResetDate)) {
                    const missionsToReset = currentUser.missions.map(m => m.category === 'daily' ? {...m, progress: 0, completed: false } : m);
                    await updateUser(currentUser.id, { lastMissionReset: today.toISOString(), missions: missionsToReset });
                }
            }
        };
        checkDailyBonusAndMissions();
    }, [currentUser, view, updateBalance, updateUser]);
    
    const handleAdComplete = useCallback(async (ad: Ad) => {
        if (!currentUser) return;
        
        await updateBalance(currentUser.id, ad.reward, 'earn', `Ad: ${ad.title}`);
        
        const userRef = doc(db, 'users', currentUser.id);
        const userDoc = await getDoc(userRef);
        if (!userDoc.exists()) return;
        const user = userDoc.data() as User;

        await updateUser(currentUser.id, { totalAdsWatched: user.totalAdsWatched + 1 });

        user.missions.forEach(mission => {
            if (mission.type === 'watch' && !mission.completed) {
                updateMissionProgress(currentUser.id, mission.id, 1);
            }
        });
    }, [currentUser, updateBalance, updateUser, updateMissionProgress]);

    const hasCompletableMissions = useMemo(() => {
        return currentUser?.missions.some(m => m.progress >= m.goal && !m.completed) ?? false;
    }, [currentUser]);

    // Admin Functions
    const fetchAllUsers = useCallback(async () => {
        const usersSnapshot = await getDocs(collection(db, 'users'));
        const usersList = usersSnapshot.docs.map(doc => doc.data() as User);
        setAllUsers(usersList);
    }, []);

    const fetchAllTransactions = useCallback(async () => {
        const transactionsQuery = query(collection(db, 'transactions'), orderBy('date', 'desc'));
        const transactionsSnapshot = await getDocs(transactionsQuery);
        const transactionsList = transactionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction));
        setAllTransactions(transactionsList);
    }, []);
    
    const toggleUserBlock = async (userId: string) => {
        const userRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
            await updateDoc(userRef, { isBlocked: !userDoc.data()?.isBlocked });
            await fetchAllUsers(); // Refresh
        }
    };
    
    const processWithdrawal = async (transactionId: string, approved: boolean) => {
        const txRef = doc(db, 'transactions', transactionId);
        const txDoc = await getDoc(txRef);
        if (!txDoc.exists()) return;
        const tx = txDoc.data() as Transaction;

        if (!approved) {
             // Refund user if not approved
            await updateBalance(tx.userId, tx.amount, 'bonus', 'Withdrawal Refund');
        }

        await updateDoc(txRef, { status: approved ? 'completed' : 'failed' });
        await fetchAllTransactions(); // Refresh
    };
    

    const contextValue = useMemo(() => ({
        currentUser,
        loading,
        setView: setViewAsync,
        logout,
        updateUser,
        addTransaction,
        updateBalance,
        updateMissionProgress,
        completeMission,
        hasCompletableMissions,
        allUsers,
        allTransactions,
        fetchAllUsers,
        fetchAllTransactions,
        toggleUserBlock,
        processWithdrawal,
    }), [currentUser, loading, logout, updateUser, addTransaction, updateBalance, updateMissionProgress, completeMission, hasCompletableMissions, allUsers, allTransactions, fetchAllUsers, fetchAllTransactions, toggleUserBlock, processWithdrawal]);
    
    const renderView = () => {
        if (loading && view === 'splash') {
            return <SplashScreen />;
        }
        if (loading) {
            return <div className="flex justify-center items-center h-screen"><LoadingSpinner /></div>;
        }

        switch (view) {
            case 'splash':
                return <SplashScreen />;
            case 'onboarding':
                return <Onboarding onComplete={() => setView('auth')} />;
            case 'auth':
                return <Auth />;
            case 'dashboard':
                return <Dashboard ads={adsData} onAdComplete={handleAdComplete} setView={setViewAsync} />;
            case 'withdraw':
                return <Withdraw />;
            case 'history':
                return <History />;
            case 'refer':
                return <Refer />;
            case 'faq':
                return <FAQ />;
            case 'missions':
                return <Missions />;
            case 'profile':
                return <Profile />;
            case 'admin':
                return <AdminPanel />;
            default:
                return currentUser ? <Dashboard ads={adsData} onAdComplete={handleAdComplete} setView={setViewAsync}/> : <Onboarding onComplete={() => setView('auth')} />;
        }
    };
    
    return (
        <UserContext.Provider value={contextValue}>
            <div className="max-w-md mx-auto min-h-screen bg-background font-sans flex flex-col">
                 {bonusInfo && <DailyBonusModal bonus={bonusInfo.amount} streak={bonusInfo.streak} onClose={() => setBonusInfo(null)} />}
                 {showReferralBonus && <ReferralBonusModal onClose={() => setShowReferralBonus(false)} />}
                <main className="flex-grow pb-24">
                    {renderView()}
                </main>
                {currentUser && !['admin', 'auth'].includes(view) && <BottomNav currentView={view} setView={setViewAsync} />}
            </div>
        </UserContext.Provider>
    );
};

export default App;