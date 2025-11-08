import React, { useState, useEffect } from 'react';
import { Ad } from '../types';
import { CheckCircleIcon, XCircleIcon, ExternalLinkIcon } from './IconComponents';

interface SiteViewerProps {
  ad: Ad;
  onComplete: (ad: Ad) => void;
  onCancel: () => void;
}

const SiteViewer: React.FC<SiteViewerProps> = ({ ad, onComplete, onCancel }) => {
  const [progress, setProgress] = useState(0);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    if (completed) return;

    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + 100 / ad.duration;
        if (newProgress >= 100) {
          clearInterval(interval);
          setCompleted(true);
          setTimeout(() => onComplete(ad), 1500);
          return 100;
        }
        return newProgress;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [ad, onComplete, completed]);
  
  const handleVisitSite = () => {
    window.open('https://www.effectivegatecpm.com/m8r9c08qev?key=4d9177439fc72ffbc9b80fce4396e674', '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-95 flex flex-col items-center justify-center z-50 text-white p-4 transition-opacity duration-300">
        <div className="w-full max-w-md">
            <div className="relative w-full h-2 bg-gray-700 rounded-full overflow-hidden mb-4">
                <div 
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-green-400 to-secondary transition-all"
                    style={{ width: `${progress}%`, transitionDuration: progress > 1 ? '1000ms' : '0ms' }}
                ></div>
            </div>
        </div>

      <div className="relative w-full aspect-video bg-gray-900 rounded-lg flex items-center justify-center shadow-2xl overflow-hidden p-4">
          {completed ? (
              <div className="text-center animate-fadeIn scale-110">
                  <CheckCircleIcon className="w-20 h-20 text-secondary mx-auto mb-4"/>
                  <h2 className="text-2xl font-bold">অভিনন্দন!</h2>
                  <p className="text-lg">আপনি পেয়েছেন ৳{ad.reward.toFixed(2)}</p>
              </div>
          ) : (
             <div className="text-center p-4">
                <p className="text-xl font-semibold">{ad.brand} এর সাইট ভিজিট করুন</p>
                <p className="text-sm text-gray-400 mt-1">পুরস্কার পেতে {ad.duration} সেকেন্ড অপেক্ষা করুন</p>
                <button 
                    onClick={handleVisitSite}
                    className="mt-6 bg-primary text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:bg-blue-500 transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center space-x-2 mx-auto"
                >
                    <ExternalLinkIcon className="w-5 h-5"/>
                    <span>সাইট ভিজিট করুন</span>
                </button>
             </div>
          )}
      </div>
      
      {!completed && (
        <button onClick={onCancel} className="absolute top-5 right-5 bg-white/10 p-2 rounded-full hover:bg-white/30 transition-colors transform hover:scale-110">
            <XCircleIcon className="w-6 h-6 text-white"/>
        </button>
      )}
    </div>
  );
};

export default SiteViewer;