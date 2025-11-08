import React, { useContext } from 'react';
import { View } from '../types';
import { HomeIcon, WalletIcon, ClipboardDocumentListIcon, RocketLaunchIcon, UserCircleIcon, FireIcon, BanknotesIcon } from './IconComponents';
import { UserContext } from '../App';

interface BottomNavProps {
  currentView: View;
  setView: (view: View) => void;
}

const navItems = [
  { view: 'dashboard' as View, label: 'হোম', icon: HomeIcon },
  { view: 'missions' as View, label: 'মিশন', icon: FireIcon },
  { view: 'withdraw' as View, label: 'উইথড্র', icon: BanknotesIcon },
  { view: 'history' as View, label: 'হিস্ট্রি', icon: ClipboardDocumentListIcon },
  { view: 'profile' as View, label: 'প্রোফাইল', icon: UserCircleIcon },
];

const BottomNav: React.FC<BottomNavProps> = ({ currentView, setView }) => {
  const context = useContext(UserContext);
  
  return (
    <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-slate-900/80 backdrop-blur-lg shadow-t-2xl rounded-t-3xl border-t border-slate-700/80">
      <div className="flex justify-around items-center h-20">
        {navItems.map(item => {
          const isActive = currentView === item.view;
          return (
            <button
              key={item.view}
              onClick={() => context?.setView(item.view)}
              className={`flex flex-col items-center justify-center w-full transition-all duration-300 relative ${isActive ? 'text-primary' : 'text-textSecondary hover:text-primary'}`}
            >
              <div className="relative">
                <item.icon className={`w-7 h-7 mb-1 transform transition-transform ${isActive ? '-translate-y-1' : ''}`} />
                 {item.view === 'missions' && context?.hasCompletableMissions && (
                    <span className="absolute -top-1 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-slate-900"></span>
                )}
              </div>
              <span className={`text-xs font-medium transition-opacity ${isActive ? 'opacity-100' : 'opacity-100'}`}>{item.label}</span>
              {isActive && (
                <div className="absolute -top-1 w-8 h-1 bg-primary rounded-full transform transition-all duration-300"></div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNav;