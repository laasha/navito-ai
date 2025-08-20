
import React from 'react';
import { useAppContext } from '../../context/AppContext';
import { useModal } from '../../context/ModalContext';
import LifeItemEditModal from '../LifeItemEditModal';
import dayjs from 'dayjs';

const GoalList: React.FC = () => {
    const { lifeItems } = useAppContext();
    const { openModal } = useModal();
    const goals = lifeItems.filter(item => item.type === 'goal').sort((a,b) => dayjs(a.dateISO).valueOf() - dayjs(b.dateISO).valueOf());

    if (goals.length === 0) {
        return <p className="text-gray-500">ჯერ არც ერთი მიზანი არ დაგიმატებია.</p>;
    }
    
    return (
        <div className="space-y-4">
            {goals.map(goal => {
                const subtasks = goal.subtasks || [];
                const completedCount = subtasks.filter(st => st.completed).length;
                const totalCount = subtasks.length;
                const percentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

                return (
                    <div key={goal.id} className="glass-effect rounded-xl p-4">
                        <div className="flex justify-between items-start">
                            <div>
                                <h4 className="font-semibold text-lg">{goal.title}</h4>
                                <p className="text-xs text-gray-400">ვადა: {dayjs(goal.dateISO).format('YYYY-MM-DD')}</p>
                            </div>
                            <button 
                                onClick={() => openModal(<LifeItemEditModal itemToEdit={goal} />)}
                                className="p-1 text-gray-400 hover:text-white"
                            >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828zM5 12V7a2 2 0 012-2h4.586a1 1 0 01.707.293l2.414 2.414a1 1 0 01.293.707V12a2 2 0 01-2 2h-7a2 2 0 01-2-2z"></path></svg>
                            </button>
                        </div>
                        <p className="text-sm text-gray-300 mt-2 mb-3">{goal.payload?.details || ''}</p>
                        {totalCount > 0 && (
                            <div className="mt-3">
                                <div className="flex justify-between mb-1">
                                    <span className="text-xs font-medium text-gray-400">პროგრესი</span>
                                    <span className="text-xs font-medium text-gray-400">{completedCount}/{totalCount}</span>
                                </div>
                                <div className="w-full bg-gray-700 rounded-full h-2.5">
                                    <div className="bg-brand-text h-2.5 rounded-full" style={{ width: `${percentage}%` }}></div>
                                </div>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default GoalList;
