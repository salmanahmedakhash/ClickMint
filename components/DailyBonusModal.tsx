import React from 'react';
import { GiftIcon } from './IconComponents';

interface DailyBonusModalProps {
    bonus: number;
    streak: number;
    onClose: () => void;
}

const DailyBonusModal: React.FC<DailyBonusModalProps> = ({ bonus, streak, onClose }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 animate-fadeIn">
            <div className="bg-surface rounded-2xl shadow-3d w-full max-w-sm text-center p-8 relative overflow-hidden animate-popIn">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-secondary to-accent"></div>
                
                <div className="mx-auto bg-accent/20 rounded-full w-20 h-20 flex items-center justify-center mb-4 animate-float">
                    <GiftIcon className="w-12 h-12 text-accent" />
                </div>
                
                <h2 className="text-2xl font-bold text-textPrimary mb-2">দৈনিক বোনাস!</h2>
                <p className="text-textSecondary mb-4">
                    আজকের লগইনের জন্য আপনাকে ধন্যবাদ। আপনি আপনার পুরস্কার পেয়েছেন!
                </p>

                <div className="bg-background p-4 rounded-lg mb-6">
                    <p className="text-lg text-textSecondary">আপনি পেয়েছেন</p>
                    <p className="text-4xl font-bold text-primary my-1">৳{bonus.toFixed(2)}</p>
                    <div className="mt-2 text-sm font-semibold bg-green-500/20 text-green-300 px-3 py-1 rounded-full inline-block">
                        {streak} দিনের স্ট্রিক!
                    </div>
                </div>

                <button
                    onClick={onClose}
                    className="w-full bg-primary text-white font-bold py-3 px-6 rounded-xl shadow-3d hover:bg-blue-500 transition-all duration-300 transform hover:scale-105 active:scale-100"
                >
                    দারুণ!
                </button>
            </div>
        </div>
    );
};

export default DailyBonusModal;