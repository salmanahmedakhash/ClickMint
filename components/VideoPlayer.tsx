import React, { useState, useEffect } from 'react';
import { Ad } from '../types';
import { CheckCircleIcon, XCircleIcon } from './IconComponents';

interface VideoPlayerProps {
  ad: Ad;
  onComplete: (ad: Ad) => void;
  onCancel: () => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ ad, onComplete, onCancel }) => {
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
          setTimeout(() => onComplete(ad), 1500); // Wait a bit before closing
          return 100;
        }
        return newProgress;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [ad, onComplete, completed]);

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

      <div className="relative w-full aspect-video bg-gray-900 rounded-lg flex items-center justify-center shadow-2xl overflow-hidden">
          {completed ? (
              <div className="text-center animate-fadeIn scale-110">
                  <CheckCircleIcon className="w-20 h-20 text-secondary mx-auto mb-4"/>
                  <h2 className="text-2xl font-bold">অভিনন্দন!</h2>
                  <p className="text-lg">আপনি পেয়েছেন ৳{ad.reward.toFixed(2)}</p>
              </div>
          ) : (
             <div className="text-center p-4">
                <p className="text-xl font-semibold">{ad.brand} এর বিজ্ঞাপন চলছে...</p>
                <p className="text-sm text-gray-400 mt-1">পুরস্কার পেতে সম্পূর্ণ দেখুন</p>
             </div>
          )}
      </div>
      
      {!completed && (
        <button onClick={onCancel} className="absolute top-5 right-5 bg-white/10 p-2 rounded-full hover:bg-white/30 transition-colors transform hover:scale-110">
            <XCircleIcon className="w-6 h-6 text-white"/>
        </button>
      )}

      {!completed && progress < 99 && (
         <div className="mt-6 bg-red-800/80 text-white text-sm px-4 py-2 rounded-lg shadow-lg">
             <p>পুরোটা দেখুন — রিওয়ার্ড পাবেন</p>
         </div>
      )}
    </div>
  );
};

export default VideoPlayer;