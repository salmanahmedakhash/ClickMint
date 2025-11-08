import React, { useState, useContext } from 'react';
import { UserContext } from '../App';
import { User, Mission } from '../types';
import { auth, db } from '../firebaseConfig';
import { doc, setDoc } from 'firebase/firestore';

interface CreateProfileProps {
    initialMissions: Mission[];
}

const CreateProfile: React.FC<CreateProfileProps> = ({ initialMissions }) => {
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const context = useContext(UserContext);
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const firebaseUser = auth.currentUser;

        // FIX: Check for email instead of phoneNumber to align with the current authentication flow.
        if (!firebaseUser || !firebaseUser.uid || !firebaseUser.email) {
            setError("Authentication error. Please try logging in again.");
            // Optionally, force logout here
            context?.logout();
            return;
        }

        if (name.trim().length < 3) {
            setError('Please enter a name with at least 3 characters.');
            return;
        }
        
        setError('');
        setLoading(true);

        const now = new Date().toISOString();
        const newUser: User = {
            id: firebaseUser.uid,
            // FIX: Replaced 'mobileNumber' with 'email' to conform to the User type.
            email: firebaseUser.email,
            name: name.trim(),
            balance: 0.00,
            lastLogin: now,
            loginStreak: 1,
            totalAdsWatched: 0,
            joinedDate: now,
            missionEarnings: 0,
            lastMissionReset: now,
            referrals: {
                count: 0,
                earnings: 0,
                referredUsers: []
            },
            missions: JSON.parse(JSON.stringify(initialMissions)) // Deep copy
        };

        try {
            await setDoc(doc(db, 'users', firebaseUser.uid), newUser);
            // After setting the document, the onAuthStateChanged listener in App.tsx
            // will detect the user and their data, and switch the view.
            // We don't need to manually set view here.
        } catch (err) {
            console.error("Error creating profile:", err);
            setError("Could not create profile. Please try again.");
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col justify-center p-6 bg-background">
            <div className="text-center mb-10 animate-fadeIn">
                <h1 className="text-3xl font-bold text-primary">আর একটি ধাপ বাকি</h1>
                <p className="text-textSecondary mt-2">আপনার প্রোফাইল সেট আপ সম্পূর্ণ করুন।</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="animate-fadeIn" style={{ animationDelay: '200ms' }}>
                    <label htmlFor="name" className="block text-sm font-medium text-textPrimary mb-1">আপনার নাম</label>
                    <input
                        type="text"
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="mt-1 block w-full px-4 py-3 bg-surface-light border border-slate-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-textPrimary"
                        placeholder="আপনার পুরো নাম লিখুন"
                        required
                    />
                </div>
                {error && <p className="text-red-500 text-sm text-center animate-fadeIn">{error}</p>}
                <div className="animate-fadeIn" style={{ animationDelay: '300ms' }}>
                    <button
                        type="submit"
                        disabled={loading || name.trim().length < 3}
                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-3d text-sm font-medium text-white bg-primary hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:bg-slate-500 disabled:cursor-not-allowed transition-all"
                    >
                        {loading ? 'সংরক্ষণ করা হচ্ছে...' : 'প্রোফাইল তৈরি করুন'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateProfile;