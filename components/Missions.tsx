import React, { useContext } from 'react';
import { UserContext } from '../App';
import { Mission } from '../types';
import LoadingSpinner from './LoadingSpinner';
import { ExternalLinkIcon } from './IconComponents';

const MissionItem: React.FC<{ mission: Mission; onComplete: (id: string) => void }> = ({ mission, onComplete }) => {
    const isCompletable = mission.progress >= mission.goal && !mission.completed;
    const isSocial = mission.type === 'social';

    const handleSocialClick = () => {
        if (mission.link) {
            window.open(mission.link, '_blank', 'noopener,noreferrer');
        }
        onComplete(mission.id);
    };

    return (
        <div className={`bg-surface p-4 rounded-xl shadow-3d transition-all duration-300 ${mission.completed ? 'opacity-60 saturate-50' : 'hover:shadow-3d-hover hover:-translate-y-1'}`}>
            <div className="flex justify-between items-center">
                <div className="flex items-center space-x-4 flex-1">
                    {mission.icon && <mission.icon className={`w-10 h-10 ${isSocial ? 'text-primary' : 'text-accent'}`} />}
                    <div className="flex-1">
                        <h3 className="font-bold text-textPrimary">{mission.title}</h3>
                        <p className="text-sm text-textSecondary">{mission.description}</p>
                        <p className="text-sm font-semibold text-secondary mt-1">বোনাস: ৳{mission.reward.toFixed(2)}</p>
                    </div>
                </div>
                <div className="ml-2">
                    {isSocial ? (
                        <button
                            onClick={handleSocialClick}
                            disabled={mission.completed}
                            className={`px-3 py-2 text-sm font-bold text-white rounded-lg shadow-md transition-all transform hover:scale-105 active:scale-95 flex items-center space-x-2 ${
                                mission.completed
                                    ? 'bg-slate-500 cursor-default'
                                    : 'bg-primary hover:bg-blue-500'
                            }`}
                        >
                            <span>{mission.completed ? 'সম্পন্ন' : 'Visit'}</span>
                            {!mission.completed && <ExternalLinkIcon className="w-4 h-4"/>}
                        </button>
                    ) : (
                        <button
                            onClick={() => onComplete(mission.id)}
                            disabled={!isCompletable}
                            className={`px-4 py-2 text-sm font-bold text-white rounded-lg shadow-md transition-colors ${
                                isCompletable
                                    ? 'bg-accent hover:bg-yellow-500'
                                    : mission.completed
                                    ? 'bg-slate-500 cursor-default'
                                    : 'bg-primary/50 cursor-not-allowed'
                            }`}
                        >
                            {mission.completed ? 'সম্পন্ন' : 'দাবি করুন'}
                        </button>
                    )}
                </div>
            </div>
            {mission.category === 'daily' && (
                <div className="mt-3">
                    <div className="w-full bg-slate-700 rounded-full h-2.5">
                        <div
                            className="bg-gradient-to-r from-green-400 to-secondary h-2.5 rounded-full transition-all duration-500"
                            style={{ width: `${(mission.progress / mission.goal) * 100}%` }}
                        ></div>
                    </div>
                    <p className="text-right text-xs text-textSecondary mt-1">
                        {mission.progress}/{mission.goal}
                    </p>
                </div>
            )}
        </div>
    );
};

const Missions: React.FC = () => {
    const context = useContext(UserContext);

    if (!context || !context.currentUser) {
        return <div className="flex items-center justify-center h-full"><LoadingSpinner /></div>;
    }

    const { currentUser, completeMission } = context;

    const handleCompleteMission = (missionId: string) => {
        completeMission(currentUser.id, missionId);
    };

    const dailyMissions = currentUser.missions.filter(m => m.category === 'daily');
    const socialMissions = currentUser.missions.filter(m => m.category === 'social');

    return (
        <div className="p-4 animate-fadeIn">
            <h1 className="text-3xl font-bold text-textPrimary mb-4">ডেইলি মিশন</h1>
            
            {dailyMissions.length > 0 && (
                <div className="mb-8">
                    <h2 className="text-xl font-semibold text-textPrimary mb-3">দৈনিক টাস্ক</h2>
                    <div className="space-y-4">
                        {dailyMissions.map((mission, index) => (
                            <div key={mission.id} className="animate-fadeIn" style={{animationDelay: `${index*100}ms`}}>
                                <MissionItem mission={mission} onComplete={handleCompleteMission} />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {socialMissions.length > 0 && (
                <div>
                     <h2 className="text-xl font-semibold text-textPrimary mb-3">সোশ্যাল টাস্ক</h2>
                    <div className="space-y-4">
                        {socialMissions.map((mission, index) => (
                            <div key={mission.id} className="animate-fadeIn" style={{animationDelay: `${(dailyMissions.length + index)*100}ms`}}>
                                <MissionItem mission={mission} onComplete={handleCompleteMission} />
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Missions;