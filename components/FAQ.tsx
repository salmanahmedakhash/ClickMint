

import React, { useState } from 'react';
import { ChevronDownIcon } from './IconComponents';

interface FaqItemProps {
    question: string;
    answer: string;
}

const FaqItem: React.FC<FaqItemProps> = ({ question, answer }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="border-b border-slate-700">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center text-left py-4 px-2 focus:outline-none"
            >
                <span className="font-semibold text-textPrimary">{question}</span>
                <ChevronDownIcon className={`w-5 h-5 text-gray-400 transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
                <div className="px-2 pb-4 text-textSecondary animate-fadeIn">
                    <p>{answer}</p>
                </div>
            )}
        </div>
    );
};

const faqData = [
    {
        question: "আমি কিভাবে টাকা তুলতে পারি?",
        answer: "আপনার ব্যালেন্স সর্বনিম্ন উইথড্রয়াল পরিমাণে পৌঁছালে, 'উইথড্রল' পেজে যান, আপনার পেমেন্ট মেথড ও তথ্য দিন এবং রিকুয়েস্ট করুন। আপনার রিকুয়েস্ট প্রক্রিয়াধীন হবে।"
    },
    {
        question: "ভিডিও দেখলেই কি টাকা নিশ্চিত?",
        answer: "হ্যাঁ, তবে শুধুমাত্র সম্পূর্ণ ভিডিও দেখলে এবং আমাদের সততার শর্তাবলী না ভাঙলে রিওয়ার্ড নিশ্চিতভাবে আপনার অ্যাকাউন্টে যোগ হবে।"
    },
    {
        question: "উইথড্রলে কত সময় লাগে?",
        answer: "সাধারণত একটি উইথড্রল রিকুয়েস্ট সম্পন্ন হতে ২৪ থেকে ৭২ ঘণ্টা সময় লাগে। এটি আপনার পেমেন্ট মেথড এবং ব্যাংকিং সময়ের উপর নির্ভর করে পরিবর্তিত হতে পারে।"
    },
    {
        question: "আমার অ্যাকাউন্ট কেন ব্লক হতে পারে?",
        answer: "একাধিক ডিভাইস থেকে একই অ্যাকাউন্ট ব্যবহার, বট বা স্বয়ংক্রিয় স্ক্রিপ্ট ব্যবহার, অথবা যেকোনো ধরনের প্রতারণামূলক কার্যকলাপ সনাক্ত হলে আপনার অ্যাকাউন্ট সাময়িক বা স্থায়ীভাবে ব্লক করা হতে পারে।"
    }
];

const FAQ: React.FC = () => {
    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold text-textPrimary mb-4">সাধারণ জিজ্ঞাসা</h1>
            <div className="bg-surface rounded-lg shadow-md">
                {faqData.map((item, index) => (
                    <FaqItem key={index} question={item.question} answer={item.answer} />
                ))}
            </div>
        </div>
    );
};

export default FAQ;