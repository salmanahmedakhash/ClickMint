import React, { useContext, useState } from 'react';
import { UserContext } from '../App';
import { ReferredUser } from '../types';
import LoadingSpinner from './LoadingSpinner';
import { ShareIcon, ClipboardDocumentCheckIcon, WhatsAppIcon, MessengerIcon } from './IconComponents';

const ReferralStats: React.FC<{ count: number; earnings: number }> = ({ count, earnings }) => (
    <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-surface p-4 rounded-xl shadow-3d text-center">
            <p className="text-sm text-textSecondary">বন্ধু যোগ দিয়েছে</p>
            <p className="text-2xl font-bold text-primary">{count}</p>
        </div>
        <div className="bg-surface p-4 rounded-xl shadow-3d text-center">
            <p className="text-sm text-textSecondary">মোট আয়</p>
            <p className="text-2xl font-bold text-secondary">৳{earnings.toFixed(2)}</p>
        </div>
    </div>
);

const ReferredUserList: React.FC<{ users: ReferredUser[] }> = ({ users }) => (
    <div className="mt-8">
        <h2 className="text-xl font-bold text-textPrimary mb-4">আপনার রেফারেল তালিকা</h2>
        <div className="space-y-3">
            {users.length > 0 ? users.map((user, index) => (
                <div key={index} className="bg-surface p-3 rounded-lg flex justify-between items-center">
                    <div>
                        <p className="font-semibold text-textPrimary">{user.name}</p>
                        <p className="text-xs text-textSecondary">Joined: {new Date(user.date).toLocaleDateString()}</p>
                    </div>
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${user.status === 'active' ? 'bg-green-500/20 text-green-300' : 'bg-yellow-500/20 text-yellow-300'}`}>
                        {user.status}
                    </span>
                </div>
            )) : <p className="text-center text-textSecondary">এখনো কেউ যোগ দেয়নি।</p>}
        </div>
    </div>
);


const Refer: React.FC = () => {
    const context = useContext(UserContext);
    const [copied, setCopied] = useState(false);
    
    if (!context || !context.currentUser) {
        return <div className="flex items-center justify-center h-full"><LoadingSpinner /></div>;
    }
    
    const { currentUser } = context;
    const referralCode = currentUser.id;
    const shareText = `ওয়েবসাইট ভিজিট করে আয় করুন! আমার রেফারেল কোড ব্যবহার করে ClickMint-এ যোগ দিন এবং রেজিস্ট্রেশনের সময় এই কোডটি ব্যবহার করে ৳5 বোনাস পান: ${referralCode}`;

    const handleCopy = () => {
        navigator.clipboard.writeText(referralCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="p-4 animate-fadeIn">
            <div className="text-center mb-6">
                <h1 className="text-3xl font-bold text-primary mb-2">বন্ধুকে আমন্ত্রণ করুন</h1>
                <p className="text-textSecondary">আপনার বন্ধুকে রেফার কোড দিয়ে জয়েন করালে আপনি পাবেন <span className="font-bold text-secondary">+ ৳5!</span> এবং আপনার বন্ধু পাবে <span className="font-bold text-secondary">৳5!</span></p>
            </div>

            <ReferralStats count={currentUser.referrals.count} earnings={currentUser.referrals.earnings} />

            <div className="bg-surface p-6 rounded-2xl shadow-3d">
                <p className="text-textSecondary text-center mb-2">আপনার রেফারেল কোড</p>
                <div className="relative flex items-center justify-center border-2 border-dashed border-slate-600 rounded-lg p-3 mb-4">
                    <span className="text-lg font-mono font-semibold text-textPrimary tracking-widest flex-grow text-center truncate pr-10">
                        {referralCode}
                    </span>
                     <button onClick={handleCopy} className="absolute right-2 bg-surface-light p-2 rounded-md">
                        {copied ? <ClipboardDocumentCheckIcon className="w-5 h-5 text-secondary"/> : <ShareIcon className="w-5 h-5 text-textSecondary"/>}
                    </button>
                </div>
                
                <p className="text-center text-sm text-textSecondary mb-4">অথবা সরাসরি শেয়ার করুন</p>
                <div className="flex justify-center space-x-4">
                    <a href={`https://wa.me/?text=${encodeURIComponent(shareText)}`} target="_blank" rel="noopener noreferrer" className="bg-[#25D366] text-white p-3 rounded-full shadow-lg transform hover:scale-110 transition-transform">
                        <WhatsAppIcon className="w-6 h-6"/>
                    </a>
                </div>
            </div>

            <ReferredUserList users={currentUser.referrals.referredUsers} />
        </div>
    );
};

export default Refer;