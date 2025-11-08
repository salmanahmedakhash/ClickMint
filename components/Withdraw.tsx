import React, { useState, useContext } from 'react';
import { UserContext } from '../App';
import LoadingSpinner from './LoadingSpinner';

const MIN_WITHDRAWAL = 100;

const Withdraw: React.FC = () => {
    const context = useContext(UserContext);
    const [method, setMethod] = useState('bKash');
    const [accountNumber, setAccountNumber] = useState('');
    const [name, setName] = useState('');
    const [amount, setAmount] = useState('');
    const [message, setMessage] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    if (!context || !context.currentUser) {
        return <div className="flex items-center justify-center h-full"><LoadingSpinner /></div>;
    }

    const { currentUser, addTransaction } = context;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsProcessing(true);
        const withdrawAmount = parseFloat(amount);

        if (isNaN(withdrawAmount) || withdrawAmount <= 0) {
            setIsSuccess(false);
            setMessage('অনুগ্রহ করে একটি বৈধ পরিমাণ লিখুন।');
            setIsProcessing(false);
            return;
        }
        if (withdrawAmount < MIN_WITHDRAWAL) {
            setIsSuccess(false);
            setMessage(`সর্বনিম্ন উইথড্রয়াল পরিমাণ ৳${MIN_WITHDRAWAL}।`);
            setIsProcessing(false);
            return;
        }
        if (withdrawAmount > currentUser.balance) {
            setIsSuccess(false);
            setMessage('আপনার অ্যাকাউন্টে পর্যাপ্ত ব্যালেন্স নেই।');
            setIsProcessing(false);
            return;
        }
        if (accountNumber.length < 11) {
            setIsSuccess(false);
            setMessage('সঠিক অ্যাকাউন্ট নম্বর দিন।');
            setIsProcessing(false);
            return;
        }
        
        await addTransaction({
            userId: currentUser.id,
            userName: currentUser.name,
            type: 'withdraw',
            amount: withdrawAmount,
            status: 'pending',
            description: `Withdraw to ${method}: ${accountNumber}`,
        });
        
        // Balance will be deducted by admin upon approval. For now, we don't deduct it here.
        // updateBalance(currentUser.id, -withdrawAmount, 'withdraw', 'Withdrawal Request');

        setIsSuccess(true);
        setMessage(`আপনার ৳${withdrawAmount} উইথড্রয়াল রিকুয়েস্ট প্রক্রিয়াধীন — ২৪–৭২ ঘণ্টার মধ্যে সম্পন্ন হবে।`);
        setAmount('');
        setAccountNumber('');
        setName('');
        setIsProcessing(false);
    };

    return (
        <div className="p-4 animate-fadeIn">
            <h1 className="text-3xl font-bold text-textPrimary mb-6">উইথড্রল করুন</h1>
            
            <div className="bg-surface p-6 rounded-xl shadow-3d mb-6">
                <p className="text-textSecondary">আপনার বর্তমান ব্যালেন্স</p>
                <p className="text-4xl font-bold text-primary">৳{currentUser.balance.toFixed(2)}</p>
                <p className="text-xs text-textSecondary mt-1">সর্বনিম্ন উইথড্রল: ৳{MIN_WITHDRAWAL}</p>
            </div>
            
            {message && (
                <div className={`p-3 rounded-lg mb-4 text-center text-sm font-medium ${isSuccess ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                    {message}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 bg-surface p-6 rounded-xl shadow-3d">
                 <div>
                    <label htmlFor="amount" className="block text-sm font-medium text-textPrimary mb-1">পরিমাণ (৳)</label>
                    <input type="number" id="amount" value={amount} onChange={e => setAmount(e.target.value)} className="mt-1 block w-full px-4 py-3 bg-surface-light border border-slate-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all" placeholder="100" />
                </div>
                <div>
                    <label htmlFor="method" className="block text-sm font-medium text-textPrimary mb-1">পেমেন্ট মেথড</label>
                    <select id="method" value={method} onChange={e => setMethod(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-3 text-base bg-surface-light border-slate-600 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent rounded-lg shadow-sm">
                        <option>bKash</option>
                        <option>Rocket</option>
                        <option>Bank Transfer</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="accountNumber" className="block text-sm font-medium text-textPrimary mb-1">অ্যাকাউন্ট নম্বর</label>
                    <input type="text" id="accountNumber" value={accountNumber} onChange={e => setAccountNumber(e.target.value)} className="mt-1 block w-full px-4 py-3 bg-surface-light border border-slate-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all" placeholder="01xxxxxxxxx" />
                </div>
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-textPrimary mb-1">নাম</label>
                    <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} className="mt-1 block w-full px-4 py-3 bg-surface-light border border-slate-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all" placeholder="অ্যাকাউন্ট হোল্ডারের নাম" />
                </div>
                <button type="submit" disabled={isProcessing} className="w-full bg-primary text-white font-bold py-3 mt-4 rounded-lg shadow-3d hover:bg-blue-500 transition-all transform hover:scale-105 active:scale-95 disabled:bg-slate-500 disabled:cursor-not-allowed">
                    {isProcessing ? 'প্রসেসিং...' : 'উইথড্রল রিকুয়েস্ট'}
                </button>
            </form>
        </div>
    );
};

export default Withdraw;