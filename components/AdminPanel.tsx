import React, { useState, useContext, useEffect } from 'react';
import { UserContext } from '../App';
import { User, Transaction, Mission } from '../types';
import { db } from '../firebaseConfig';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import LoadingSpinner from './LoadingSpinner';
import { UserGroupIcon, WalletIcon, RocketLaunchIcon, UserMinusIcon, UserPlusIcon, CheckIcon, XMarkIcon, PencilSquareIcon } from './IconComponents';

type AdminView = 'users' | 'withdrawals' | 'missions';

const UserEditModal: React.FC<{
    user: User;
    onSave: (userId: string, updates: Partial<User>) => void;
    onCancel: () => void;
}> = ({ user, onSave, onCancel }) => {
    const [name, setName] = useState(user.name || '');
    const [balance, setBalance] = useState(user.balance.toString());

    const handleSave = () => {
        const updates: Partial<User> = {};
        if (name !== (user.name || '')) {
            updates.name = name;
        }
        const newBalance = parseFloat(balance);
        if (!isNaN(newBalance) && newBalance.toFixed(2) !== user.balance.toFixed(2)) {
            updates.balance = newBalance;
        }

        if (Object.keys(updates).length > 0) {
            onSave(user.id, updates);
        }
        onCancel();
    };
    
    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-surface-light p-6 rounded-xl w-full max-w-md space-y-4 animate-popIn">
                <h3 className="text-lg font-bold text-textPrimary">ব্যবহারকারী এডিট: {user.name}</h3>
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-textPrimary mb-1">নাম</label>
                    <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-background p-2 rounded" />
                </div>
                <div>
                    <label htmlFor="balance" className="block text-sm font-medium text-textPrimary mb-1">ব্যালেন্স (৳)</label>
                    <input id="balance" type="number" step="0.01" value={balance} onChange={(e) => setBalance(e.target.value)} className="w-full bg-background p-2 rounded" />
                </div>
                <div className="flex justify-end space-x-2 pt-2">
                    <button type="button" onClick={onCancel} className="bg-slate-600 px-4 py-2 rounded-lg font-semibold hover:bg-slate-500 transition-colors">বাতিল</button>
                    <button type="button" onClick={handleSave} className="bg-primary px-4 py-2 rounded-lg font-semibold hover:bg-blue-500 transition-colors">সংরক্ষণ</button>
                </div>
            </div>
        </div>
    );
};

const AdminPanel: React.FC = () => {
    const context = useContext(UserContext);
    const [view, setView] = useState<AdminView>('users');
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [loadingData, setLoadingData] = useState(true);

    useEffect(() => {
        const loadAdminData = async () => {
            if (context) {
                setLoadingData(true);
                await Promise.all([
                    context.fetchAllUsers(),
                    context.fetchAllTransactions()
                ]);
                setLoadingData(false);
            }
        };
        loadAdminData();
    }, [context]);

    if (!context) return <LoadingSpinner />;

    const { allUsers, allTransactions, toggleUserBlock, processWithdrawal, setView: setAppView, updateUser } = context;

    const pendingWithdrawals = allTransactions.filter(tx => tx.type === 'withdraw' && tx.status === 'pending');

    const renderUsers = () => (
        <div className="space-y-3">
            <h2 className="text-xl font-bold text-textPrimary mb-4">ব্যবহারকারী ব্যবস্থাপনা</h2>
            {allUsers.map(user => (
                <div key={user.id} className="bg-surface p-4 rounded-lg flex items-center justify-between">
                    <div>
                        <p className="font-semibold text-textPrimary">{user.name || 'No Name'} ({user.email})</p>
                        <p className="text-sm text-textSecondary">Balance: ৳{user.balance.toFixed(2)}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                         <button onClick={() => setEditingUser(user)} className="p-2 bg-blue-500/20 rounded-full text-blue-400 hover:bg-blue-500/40">
                            <PencilSquareIcon className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => toggleUserBlock(user.id)}
                            className={`px-3 py-1 text-sm font-semibold rounded-full flex items-center space-x-1 ${user.isBlocked ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}
                        >
                            {user.isBlocked ? <UserMinusIcon className="w-4 h-4" /> : <UserPlusIcon className="w-4 h-4" />}
                            <span>{user.isBlocked ? 'Blocked' : 'Active'}</span>
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );

    const renderWithdrawals = () => (
        <div className="space-y-3">
            <h2 className="text-xl font-bold text-textPrimary mb-4">উইথড্রল অনুরোধ ({pendingWithdrawals.length})</h2>
            {pendingWithdrawals.length === 0 ? <p className="text-textSecondary text-center">কোনো পেন্ডিং অনুরোধ নেই।</p> : null}
            {pendingWithdrawals.map(tx => (
                <div key={tx.id} className="bg-surface p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-semibold text-textPrimary">{tx.userName} ({tx.userId.slice(-6)})</p>
                            <p className="text-lg font-bold text-primary">৳{tx.amount.toFixed(2)}</p>
                            <p className="text-xs text-textSecondary">{tx.description}</p>
                        </div>
                        <div className="flex space-x-2">
                            <button onClick={() => processWithdrawal(tx.id, true)} className="p-2 bg-green-500/20 rounded-full text-green-400 hover:bg-green-500/40">
                                <CheckIcon className="w-5 h-5" />
                            </button>
                            <button onClick={() => processWithdrawal(tx.id, false)} className="p-2 bg-red-500/20 rounded-full text-red-400 hover:bg-red-500/40">
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );

    const renderMissions = () => (
        <div>
            <h2 className="text-xl font-bold text-textPrimary mb-4">মিশন ব্যবস্থাপনা</h2>
            <p className="text-textSecondary text-center">মিশন ম্যানেজমেন্ট কার্যকারিতা শীঘ্রই আসছে।</p>
        </div>
    );

    const renderContent = () => {
        if (loadingData) return <LoadingSpinner />;
        switch (view) {
            case 'users': return renderUsers();
            case 'withdrawals': return renderWithdrawals();
            case 'missions': return renderMissions();
            default: return null;
        }
    };
    
    const TabButton: React.FC<{ targetView: AdminView, label: string, icon: React.ElementType, count?: number }> = ({ targetView, label, icon: Icon, count }) => (
        <button onClick={() => setView(targetView)} className={`relative flex-1 p-2 rounded-t-lg ${view === targetView ? 'bg-surface text-primary' : 'text-textSecondary'}`}>
            <Icon className="w-6 h-6 mx-auto mb-1"/>
            <span className="text-xs">{label}</span>
            {count && count > 0 ? <span className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">{count}</span> : null}
        </button>
    );

    return (
        <div className="p-4 bg-background min-h-screen">
            {editingUser && (
                <UserEditModal 
                    user={editingUser}
                    onSave={async (id, updates) => {
                        await updateUser(id, updates);
                        await context.fetchAllUsers();
                        setEditingUser(null);
                    }}
                    onCancel={() => setEditingUser(null)}
                />
            )}
            <div className="flex justify-between items-center mb-4">
                 <h1 className="text-2xl font-bold text-textPrimary">অ্যাডমিন প্যানেল</h1>
                 <button onClick={() => setAppView('profile')} className="text-sm text-primary">প্রোফাইল</button>
            </div>
           
            <div className="flex bg-surface-light rounded-t-lg">
                <TabButton targetView="users" label="ব্যবহারকারী" icon={UserGroupIcon} count={allUsers.length} />
                <TabButton targetView="withdrawals" label="উইথড্রল" icon={WalletIcon} count={pendingWithdrawals.length} />
                <TabButton targetView="missions" label="মিশন" icon={RocketLaunchIcon} />
            </div>
            <div className="bg-surface p-4 rounded-b-lg">
                {renderContent()}
            </div>
        </div>
    );
};

export default AdminPanel;