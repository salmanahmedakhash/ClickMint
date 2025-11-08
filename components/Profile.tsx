import React, { useContext, useEffect, useState } from 'react';
import { UserContext } from '../App';
import { View } from '../types';
import LoadingSpinner from './LoadingSpinner';
import { ArrowRightOnRectangleIcon, CalendarDaysIcon, GlobeAltIcon, UserGroupIcon, RocketLaunchIcon, WalletIcon, BanknotesIcon, FireIcon, BellIcon, BellSlashIcon } from './IconComponents';

const colorClasses: { [key: string]: { bg: string, text: string } } = {
    blue: { bg: 'bg-blue-500/20', text: 'text-blue-400' },
    green: { bg: 'bg-green-500/20', text: 'text-green-400' },
    red: { bg: 'bg-red-500/20', text: 'text-red-400' },
    yellow: { bg: 'bg-yellow-500/20', text: 'text-yellow-400' },
    indigo: { bg: 'bg-indigo-500/20', text: 'text-indigo-400' },
    purple: { bg: 'bg-purple-500/20', text: 'text-purple-400' },
};

const StatCard: React.FC<{ icon: React.ElementType, label: string, value: string | number, color: string }> = ({ icon: Icon, label, value, color }) => (
    <div className="bg-surface p-4 rounded-xl shadow-3d flex items-center space-x-4">
        <div className={`p-3 rounded-full ${colorClasses[color]?.bg || 'bg-gray-500/20'}`}>
            <Icon className={`w-7 h-7 ${colorClasses[color]?.text || 'text-gray-400'}`} />
        </div>
        <div>
            <p className="text-sm text-textSecondary">{label}</p>
            <p className="text-xl font-bold text-textPrimary">{value}</p>
        </div>
    </div>
);

const Profile: React.FC = () => {
    const context = useContext(UserContext);
    const [isAdmin, setIsAdmin] = useState(false);
    
    useEffect(() => {
        if(context?.currentUser) {
            // Admin check based on a specific email address.
            setIsAdmin(context.currentUser.email === 'admin@watchearn.app'); // Example admin email
        }
    }, [context?.currentUser]);


    if (!context || !context.currentUser) {
        return <div className="flex items-center justify-center h-full"><LoadingSpinner /></div>;
    }
    const { currentUser, logout, setView, updateUser } = context;
    const totalEarnings = currentUser.balance; 
    
    const handleNotificationToggle = async () => {
        if (!context || !context.currentUser) return;
        const newStatus = !currentUser.notificationsEnabled;
        // The NotificationHandler component will react to this change.
        await updateUser(currentUser.id, { notificationsEnabled: newStatus });
    };

    return (
        <div className="p-4 animate-fadeIn">
            <div className="flex flex-col items-center text-center mb-8">
                <div className="relative">
                    <img src={`https://api.dicebear.com/8.x/initials/svg?seed=${currentUser.name || 'CM'}&backgroundColor=334155&textColor=f1f5f9`} alt="avatar" className="w-24 h-24 rounded-full mb-3 border-4 border-surface shadow-lg"/>
                </div>
                <h1 className="text-2xl font-bold text-textPrimary">{currentUser.name || 'ClickMint User'}</h1>
                <p className="text-textSecondary">{currentUser.email}</p>
                <p className="text-xs text-textSecondary mt-1">সদস্য হয়েছেন: {new Date(currentUser.joinedDate).toLocaleDateString()}</p>
            </div>

            <div className="mb-8">
                 <h2 className="text-lg font-bold text-textPrimary mb-4">অ্যাকাউন্ট সারাংশ</h2>
                 <div className="grid grid-cols-2 gap-4">
                     <StatCard icon={BanknotesIcon} label="বর্তমান ব্যালেন্স" value={`৳${totalEarnings.toFixed(2)}`} color="blue" />
                     <StatCard icon={CalendarDaysIcon} label="লগইন স্ট্রিক" value={`${currentUser.loginStreak} দিন`} color="green" />
                     <StatCard icon={GlobeAltIcon} label="সাইট ভিজিট হয়েছে" value={currentUser.totalSitesVisited} color="red" />
                     <StatCard icon={FireIcon} label="মিশন আয়" value={`৳${currentUser.missionEarnings.toFixed(2)}`} color="yellow" />
                     <StatCard icon={UserGroupIcon} label="রেফারেল আয়" value={`৳${currentUser.referrals.earnings.toFixed(2)}`} color="indigo" />
                     <StatCard icon={UserGroupIcon} label="বন্ধু যোগ দিয়েছে" value={currentUser.referrals.count} color="purple" />
                 </div>
            </div>

             <div className="mb-8">
                <h2 className="text-lg font-bold text-textPrimary mb-4">সেটিংস</h2>
                <div className="bg-surface p-4 rounded-lg shadow-sm flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                        {currentUser.notificationsEnabled ? <BellIcon className="w-6 h-6 text-textSecondary"/> : <BellSlashIcon className="w-6 h-6 text-textSecondary"/>}
                        <span className="font-semibold text-textPrimary">পুশ নোটিফিকেশন</span>
                    </div>
                    <button onClick={handleNotificationToggle} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${currentUser.notificationsEnabled ? 'bg-primary' : 'bg-slate-600'}`}>
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${currentUser.notificationsEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                </div>
            </div>

            <div className="space-y-3">
                 {isAdmin && (
                     <button onClick={() => setView('admin')} className="w-full text-left bg-premium-dark p-4 rounded-lg shadow-sm flex justify-between items-center transition-colors hover:bg-premium-light">
                        <span className="font-semibold text-white">অ্যাডমিন প্যানেল</span>
                        <ChevronRightIcon />
                    </button>
                 )}
                 <button onClick={() => setView('faq')} className="w-full text-left bg-surface p-4 rounded-lg shadow-sm flex justify-between items-center transition-colors hover:bg-surface-light">
                    <span className="font-semibold text-textPrimary">সাধারণ জিজ্ঞাসা (FAQ)</span>
                    <ChevronRightIcon />
                </button>
                 <button onClick={() => setView('history')} className="w-full text-left bg-surface p-4 rounded-lg shadow-sm flex justify-between items-center transition-colors hover:bg-surface-light">
                    <span className="font-semibold text-textPrimary">লেনদেনের ইতিহাস</span>
                    <ChevronRightIcon />
                </button>
                <button
                    onClick={logout}
                    className="w-full bg-red-500 text-white font-bold py-3 px-4 mt-4 rounded-lg shadow-3d hover:bg-red-600 transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center space-x-2"
                >
                    <ArrowRightOnRectangleIcon className="w-6 h-6"/>
                    <span>লগ আউট</span>
                </button>
            </div>
        </div>
    );
};

const ChevronRightIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-gray-400">
        <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
    </svg>
);

export default Profile;