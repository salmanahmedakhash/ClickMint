import React, { useContext, useState, useEffect } from 'react';
import { UserContext } from '../App';
import { Transaction } from '../types';
import { db } from '../firebaseConfig';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import LoadingSpinner from './LoadingSpinner';
import { ArrowUpCircleIcon, ArrowDownCircleIcon, GiftIcon, UserPlusIcon, CalendarDaysIcon, AdjustmentsHorizontalIcon } from './IconComponents';

const TransactionIcon: React.FC<{ type: Transaction['type'] }> = ({ type }) => {
    switch(type) {
        case 'earn': return <ArrowUpCircleIcon className="w-8 h-8 text-green-400" />;
        case 'withdraw': return <ArrowDownCircleIcon className="w-8 h-8 text-red-400" />;
        case 'bonus': return <GiftIcon className="w-8 h-8 text-yellow-400" />;
        case 'referral': return <UserPlusIcon className="w-8 h-8 text-blue-400" />;
        case 'daily-bonus': return <CalendarDaysIcon className="w-8 h-8 text-indigo-400" />;
        case 'admin-adjustment': return <AdjustmentsHorizontalIcon className="w-8 h-8 text-purple-400" />;
        default: return null;
    }
};

const StatusBadge: React.FC<{ status: Transaction['status'] }> = ({ status }) => {
    const baseClasses = "text-xs font-semibold px-2 py-1 rounded-full";
    switch(status) {
        case 'completed': return <span className={`${baseClasses} bg-green-500/20 text-green-300`}>Completed</span>;
        case 'pending': return <span className={`${baseClasses} bg-yellow-500/20 text-yellow-300`}>Pending</span>;
        case 'failed': return <span className={`${baseClasses} bg-red-500/20 text-red-300`}>Failed</span>;
        default: return null;
    }
}

const History: React.FC = () => {
    const context = useContext(UserContext);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        if (context?.currentUser) {
            setLoading(true);
            const q = query(
                collection(db, 'transactions'),
                where('userId', '==', context.currentUser.id),
                orderBy('date', 'desc')
            );

            const unsubscribe = onSnapshot(q, (snapshot) => {
                const userTransactions = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                } as Transaction));
                setTransactions(userTransactions);
                setLoading(false);
            });

            return () => unsubscribe();
        }
    }, [context?.currentUser]);
    
    if (loading) {
        return <div className="flex items-center justify-center h-full"><LoadingSpinner /></div>;
    }
    
    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold text-textPrimary mb-4">লেনদেনের ইতিহাস</h1>
            {transactions.length === 0 ? (
                <div className="text-center py-10">
                    <p className="text-textSecondary">কোনো লেনদেন পাওয়া যায়নি।</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {transactions.map(tx => (
                        <div key={tx.id} className="bg-surface p-4 rounded-lg shadow-md flex items-center space-x-4">
                            <TransactionIcon type={tx.type} />
                            <div className="flex-grow">
                                <p className="font-bold capitalize text-textPrimary">{tx.description}</p>
                                <p className="text-sm text-textSecondary">{new Date(tx.date).toLocaleString()}</p>
                            </div>
                            <div className="text-right">
                                <p className={`font-bold text-lg ${tx.amount < 0 || tx.type === 'withdraw' ? 'text-red-400' : 'text-green-400'}`}>
                                    {tx.amount < 0 || tx.type === 'withdraw' ? '-' : '+'}৳{Math.abs(tx.amount).toFixed(2)}
                                </p>
                                <StatusBadge status={tx.status}/>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default History;