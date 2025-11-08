import React, { useContext, useState, useEffect } from 'react';
import { UserContext } from '../App';
import { Ad, View } from '../types';
import LoadingSpinner from './LoadingSpinner';
import { WalletIcon, PlayCircleIcon, ClockIcon, CursorArrowRaysIcon, RocketLaunchIcon, ClipboardDocumentListIcon, CheckBadgeIcon, BanknotesIcon, FireIcon, GiftIcon } from './IconComponents';

interface DashboardProps {
  ads: Ad[];
  onAdComplete: (ad: Ad) => void;
  setView: (view: View) => void;
}

const EarningsChart: React.FC = () => {
    const dailyEarnings = [45, 60, 75, 50, 90, 80, 100]; // Mock data
    const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    const maxEarning = Math.max(...dailyEarnings, 1);
    
    const points = dailyEarnings.map((value, index) => {
        const x = (index / (dailyEarnings.length - 1)) * 100;
        const y = 100 - (value / maxEarning) * 90;
        return `${x},${y}`;
    }).join(' ');

    const areaPoints = `${points} 100,100 0,100`;

    return (
        <div className="bg-surface p-4 rounded-2xl shadow-3d mb-6 animate-fadeIn" style={{animationDelay: '300ms'}}>
            <h3 className="font-bold text-textPrimary mb-4"> সাপ্তাহিক আয়</h3>
            <div className="h-40 relative text-primary">
                <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
                    <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" style={{stopColor: 'rgba(96, 165, 250, 0.3)'}} />
                            <stop offset="100%" style={{stopColor: 'rgba(96, 165, 250, 0)'}} />
                        </linearGradient>
                    </defs>
                    <polyline fill="url(#gradient)" points={areaPoints} />
                    <polyline
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        points={points}
                        className="animate-draw-line"
                        style={{ strokeDasharray: 200, strokeDashoffset: 200, animation: 'draw-line 1.5s 0.2s forwards ease-out' }}
                    />
                     {dailyEarnings.map((value, index) => {
                         const x = (index / (dailyEarnings.length - 1)) * 100;
                         const y = 100 - (value / maxEarning) * 90;
                         return <circle key={index} cx={x} cy={y} r="1.5" fill="#0F172A" stroke="currentColor" strokeWidth="1" />;
                     })}
                </svg>
            </div>
            <div className="flex justify-between mt-2">
                {days.map(day => <span key={day} className="text-xs text-textSecondary font-medium">{day}</span>)}
            </div>
        </div>
    );
};

const QuickActions: React.FC<{ setView: (view: View) => void }> = ({ setView }) => {
    const context = useContext(UserContext);
    const actions = [
        { label: 'উইথড্র', icon: BanknotesIcon, view: 'withdraw' as View },
        { label: 'মিশন', icon: FireIcon, view: 'missions' as View },
        { label: 'হিস্ট্রি', icon: ClipboardDocumentListIcon, view: 'history' as View },
    ];

    return (
        <div className="grid grid-cols-3 gap-4 mb-6 animate-fadeIn" style={{animationDelay: '200ms'}}>
            {actions.map(action => (
                <button 
                    key={action.view} 
                    onClick={() => setView(action.view)} 
                    className="relative bg-surface p-4 rounded-2xl shadow-3d text-center flex flex-col items-center justify-center space-y-2 transform hover:-translate-y-1 transition-transform duration-300"
                >
                    {action.view === 'missions' && context?.hasCompletableMissions && (
                        <span className="absolute top-2 right-2 w-3 h-3 bg-red-500 rounded-full border-2 border-surface animate-pulse"></span>
                    )}
                    <action.icon className="w-8 h-8 text-primary"/>
                    <span className="text-sm font-semibold text-textPrimary">{action.label}</span>
                </button>
            ))}
        </div>
    );
}

const CooldownTimer: React.FC<{ timeLeft: string }> = ({ timeLeft }) => (
    <div className="bg-surface p-4 rounded-xl shadow-3d text-center mb-4 animate-fadeIn">
        <h3 className="font-bold text-accent">কাজের বিরতি চলছে</h3>
        <p className="text-textSecondary text-sm mt-1">পরবর্তী কাজ পাওয়া যাবে:</p>
        <p className="text-2xl font-bold text-primary font-mono tracking-wider mt-2">{timeLeft}</p>
    </div>
);


const Dashboard: React.FC<DashboardProps> = ({ ads, onAdComplete, setView }) => {
  const context = useContext(UserContext);
  const [visibleAdsCount, setVisibleAdsCount] = useState(10);
  const [processingAds, setProcessingAds] = useState<string[]>([]);
  const [timeLeft, setTimeLeft] = useState<string | null>(null);

  useEffect(() => {
    if (!context?.currentUser?.adCooldownEndTime) {
      setTimeLeft(null);
      return;
    }

    const cooldownEndTime = new Date(context.currentUser.adCooldownEndTime);

    const timer = setInterval(() => {
        const now = new Date();
        const remaining = cooldownEndTime.getTime() - now.getTime();

        if (remaining <= 0) {
            clearInterval(timer);
            setTimeLeft(null);
        } else {
            const hours = Math.floor((remaining / (1000 * 60 * 60)) % 24);
            const minutes = Math.floor((remaining / 1000 / 60) % 60);
            const seconds = Math.floor((remaining / 1000) % 60);
            setTimeLeft(`${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`);
        }
    }, 1000);

    return () => clearInterval(timer);
  }, [context?.currentUser?.adCooldownEndTime]);

  if (!context || !context.currentUser) {
    return <div className="flex items-center justify-center h-full"><LoadingSpinner /></div>;
  }
  const { currentUser } = context;

  const handleAdClick = (ad: Ad) => {
    if (processingAds.includes(ad.id)) return;

    setProcessingAds(prev => [...prev, ad.id]);

    window.open('https://www.effectivegatecpm.com/m8r9c08qev?key=4d9177439fc72ffbc9b80fce4396e674', '_blank', 'noopener,noreferrer');
    setTimeout(() => {
      onAdComplete(ad);
      setProcessingAds(prev => prev.filter(id => id !== ad.id));
    }, ad.duration * 1000);
  };

  const watchedAdIds = currentUser.watchedAdIdsToday || [];
  const allAdsWatched = watchedAdIds.length >= ads.length;


  return (
    <div className="p-4 bg-background min-h-full">
        <div className="flex items-center space-x-4 mb-6 animate-fadeIn">
             <img src={`https://api.dicebear.com/8.x/initials/svg?seed=${currentUser.name || 'CM'}&backgroundColor=334155&textColor=f1f5f9`} alt="avatar" className="w-14 h-14 rounded-full border-2 border-surface-light"/>
            <div>
                <p className="text-md text-textSecondary">আবারও স্বাগতম,</p>
                <h1 className="text-2xl font-bold text-textPrimary -mt-1">{currentUser.name || 'ClickMint User'}</h1>
            </div>
        </div>

      <div className="bg-gradient-to-br from-premium-light to-premium-dark text-white p-6 rounded-2xl shadow-2xl mb-6 transform hover:scale-105 transition-transform duration-300 animate-fadeIn" style={{animationDelay: '100ms'}}>
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm opacity-80">আপনার ব্যালান্স</p>
            <p className="text-4xl font-bold">৳{currentUser.balance.toFixed(2)}</p>
          </div>
          <WalletIcon className="w-12 h-12 opacity-50" />
        </div>
      </div>
      
      <QuickActions setView={setView} />

       <div 
        className="bg-secondary/20 p-4 rounded-2xl shadow-3d flex items-center justify-between mb-6 animate-fadeIn cursor-pointer transform hover:-translate-y-1 transition-transform" 
        style={{animationDelay: '400ms'}}
        onClick={() => setView('refer')}>
            <div>
                <h3 className="font-bold text-secondary">বন্ধুদের রেফার করুন</h3>
                <p className="text-sm text-green-300">এবং আয় করুন +৳{currentUser.referrals.earnings.toFixed(2)} পর্যন্ত!</p>
            </div>
            <GiftIcon className="w-10 h-10 text-secondary"/>
       </div>

      <EarningsChart/>
      
      <div className="text-left mb-4 animate-fadeIn" style={{animationDelay: '500ms'}}>
        <h2 className="text-xl font-bold text-textPrimary">কাজ করে আয় করুন</h2>
        <p className="text-textSecondary text-sm">প্রতিটি কাজ সম্পূর্ণ করলে রিওয়ার্ড পাবেন।</p>
      </div>

      {allAdsWatched && timeLeft && <CooldownTimer timeLeft={timeLeft} />}
      
      {!allAdsWatched && (
      <div className="space-y-4">
        {ads.slice(0, visibleAdsCount).map((ad, index) => {
          const isProcessing = processingAds.includes(ad.id);
          const isWatched = watchedAdIds.includes(ad.id);
          return (
            <div 
              key={ad.id} 
              className={`bg-surface p-4 rounded-xl shadow-3d flex items-center space-x-4 transition-all duration-300 ${isWatched ? 'opacity-60' : 'transform hover:-translate-y-1 hover:shadow-3d-hover'} animate-fadeIn`}
              style={{animationDelay: `${600 + (index % 10) * 50}ms`}}
            >
              <div className="bg-primary/20 p-3 rounded-full">
                  <CursorArrowRaysIcon className="w-8 h-8 text-primary"/>
              </div>
              <div className="flex-grow">
                <h3 className="font-bold text-textPrimary">{ad.title}</h3>
                <div className="flex items-center text-sm text-textSecondary mt-1 space-x-4">
                    <span className="font-semibold text-secondary">রিওয়ার্ড: ৳{ad.reward.toFixed(2)}</span>
                    <div className="flex items-center">
                      <ClockIcon className="w-4 h-4 mr-1"/>
                      <span>{ad.duration}s</span>
                    </div>
                </div>
              </div>
              <button 
                  onClick={() => handleAdClick(ad)}
                  disabled={isProcessing || isWatched}
                  className={`font-semibold py-2 px-4 rounded-lg shadow-md transition-all flex items-center justify-center space-x-2 w-32 ${
                      isProcessing ? 'bg-slate-500 text-white cursor-not-allowed' :
                      isWatched ? 'bg-slate-600 text-textSecondary cursor-not-allowed' :
                      'bg-secondary text-white hover:bg-green-500 hover:scale-105 active:scale-95'}`}
              >
                  {isWatched ? (
                      <>
                        <CheckBadgeIcon className="w-5 h-5" />
                        <span>দেখা হয়েছে</span>
                      </>
                    ) : isProcessing ? 'প্রসেসিং...' : 'দেখুন'
                  }
              </button>
            </div>
          )
        })}
      </div>
      )}
      {!allAdsWatched && visibleAdsCount < ads.length && (
        <div className="mt-6 text-center">
            <button
                onClick={() => setVisibleAdsCount(prev => Math.min(prev + 10, ads.length))}
                className="bg-surface-light text-textPrimary font-semibold py-3 px-6 rounded-lg shadow-md hover:bg-primary hover:text-white transition-all transform hover:scale-105 active:scale-95"
            >
                আরো দেখুন
            </button>
        </div>
    )}
    </div>
  );
};

export default Dashboard;