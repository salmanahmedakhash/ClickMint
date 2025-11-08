import React, { useState, useRef, TouchEvent, MouseEvent } from 'react';
import { CursorArrowRaysIcon, ShieldCheckIcon, ExclamationTriangleIcon } from './IconComponents';

interface OnboardingProps {
  onComplete: () => void;
}

const cards = [
  {
    icon: <CursorArrowRaysIcon className="w-20 h-20 text-primary" />,
    headline: "দ্রুত আয়, প্রত্যেক ভিজিটে টাকা।",
    body: "ওয়েবসাইট ভিজিট করুন — রিওয়ার্ড পান।",
    buttonText: "শুরু করুন"
  },
  {
    icon: <ShieldCheckIcon className="w-20 h-20 text-secondary" />,
    headline: "নিরাপদ পে-আউট।",
    body: "বিকাশ/রকেট/অন্যান্য পদ্ধতিতে উত্তোলন করুন।",
    buttonText: "কিভাবে কাজ করে?"
  },
  {
    icon: <ExclamationTriangleIcon className="w-20 h-20 text-accent" />,
    headline: "সততার শর্ত।",
    body: "ফ্রড হলে একাউন্ট বন্ধ/রিফান্ড কাটা হবে — শর্তাবলী মেনে চলুন।",
    buttonText: "অ্যাকাউন্ট খুলুন"
  }
];

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [currentCard, setCurrentCard] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const isDragging = useRef(false);
  const dragStart = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);


  const handleDragStart = (clientX: number) => {
    isDragging.current = true;
    dragStart.current = clientX;
    if(containerRef.current) {
        containerRef.current.style.transition = 'none';
    }
  };

  const handleDragMove = (clientX: number) => {
    if (!isDragging.current) return;
    const offset = clientX - dragStart.current;
    setDragOffset(offset);
  };
  
  const handleDragEnd = () => {
    isDragging.current = false;
     if(containerRef.current) {
        containerRef.current.style.transition = 'transform 0.3s ease-in-out';
    }

    const dragThreshold = 50;
    if (dragOffset < -dragThreshold && currentCard < cards.length - 1) {
      setCurrentCard(currentCard + 1);
    } else if (dragOffset > dragThreshold && currentCard > 0) {
      setCurrentCard(currentCard - 1);
    }
    setDragOffset(0);
  };

  const handleTouchStart = (e: TouchEvent) => handleDragStart(e.touches[0].clientX);
  const handleTouchMove = (e: TouchEvent) => handleDragMove(e.touches[0].clientX);
  
  const handleMouseDown = (e: MouseEvent) => handleDragStart(e.clientX);
  const handleMouseMove = (e: MouseEvent) => handleDragMove(e.clientX);
  const handleMouseUp = () => handleDragEnd();
  const handleMouseLeave = () => { if(isDragging.current) handleDragEnd(); };


  const handleButtonClick = () => {
    if (currentCard < cards.length - 1) {
      setCurrentCard(currentCard + 1);
    } else {
      onComplete();
    }
  };

  return (
    <div 
        className="flex flex-col h-screen justify-between p-8 bg-surface overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleDragEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
    >
      <div className="flex-grow flex flex-col items-center justify-center text-center pt-10">
        <div 
            ref={containerRef}
            className="flex w-full" 
            style={{ 
                transform: `translateX(calc(-${currentCard * 100}% + ${dragOffset}px))`,
                transition: 'transform 0.3s ease-in-out',
            }}
        >
          {cards.map((card, index) => (
              <div key={index} className="w-full flex-shrink-0 flex flex-col items-center justify-center">
                  <div className="relative w-48 h-48 flex items-center justify-center mb-10">
                      <div className="absolute inset-0 bg-primary/20 rounded-full animate-pulse"></div>
                      <div>{card.icon}</div>
                  </div>
                  <div>
                      <h2 className="text-3xl font-bold text-textPrimary mb-4">{card.headline}</h2>
                      <p className="text-textSecondary px-4">{card.body}</p>
                  </div>
              </div>
          ))}
        </div>
      </div>
      
      <div className="flex items-center justify-center space-x-2 my-8">
        {cards.map((_, index) => (
          <div
            key={index}
            onClick={() => setCurrentCard(index)}
            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 cursor-pointer ${currentCard === index ? 'bg-primary scale-150' : 'bg-slate-600'}`}
          />
        ))}
      </div>

      <button
        onClick={handleButtonClick}
        className="w-full bg-primary text-white font-bold py-4 px-6 rounded-xl shadow-3d hover:bg-blue-500 transition-all duration-300 transform hover:scale-105 active:scale-100"
      >
        {cards[currentCard].buttonText}
      </button>
    </div>
  );
};

export default Onboarding;