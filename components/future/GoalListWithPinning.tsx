
import React from 'react';
import { useAppContext } from '../../context/AppContext';
import { useModal } from '../../context/ModalContext';
import LifeItemEditModal from '../LifeItemEditModal';
import dayjs from 'dayjs';

const PinIcon: React.FC = () => <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M10 3a1 1 0 011 1v5.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 9.586V4a1 1 0 011-1z" /><path d="M3.5 10.5a.5.5 0 01.5-.5h12a.5.5 0 010 1h-12a.5.5 0 01-.5-.5zM10 12a2 2 0 100 4 2 2 0 000-4z" /></svg>;
const EditIcon: React.FC = () => <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828zM5 12V7a2 2 0 012-2h4.586a1 1 0 01.707.293l2.414 2.414a1 1 0 01.293.707V12a2 2 0 01-2 2h-7a2 2 0 01-2-2z"></path></svg>;

const GoalListWithPinning: React.FC = () => {
    const { lifeItems, pinnedGoalId, togglePinnedGoal, userSettings } = useAppContext();
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
                const isPinned = pinnedGoalId === goal.id;

                const alignedValueIds = goal.payload?.alignedValues || [];
                const valueObjects = alignedValueIds
                    .map(id => userSettings.values.find(v => v.id === id))
                    .filter(Boolean);


                return (
                    <div key={goal.id} className={`glass-effect rounded-xl p-4 border ${isPinned ? 'border-accent-color' : 'border-transparent'}`}>
                        <div className="flex justify-between items-start">
                            <div>
                                <h4 className="font-semibold text-lg">{goal.title}</h4>
                                <p className="text-xs text-gray-400">ვადა: {dayjs(goal.dateISO).format('YYYY-MM-DD')}</p>
                            </div>
                            <div className="flex items-center space-x-2">
                                <button 
                                    onClick={() => togglePinnedGoal(goal.id)}
                                    title={isPinned ? "ფოკუსის მოხსნა" : "ფოკუსირება"}
                                    className={`p-2 rounded-full transition-colors ${isPinned ? 'bg-accent-color text-white' : 'text-gray-500 hover:bg-white/10 hover:text-white'}`}
                                >
                                    <PinIcon />
                                </button>
                                <button 
                                    onClick={() => openModal(<LifeItemEditModal itemToEdit={goal} />)}
                                    className="p-2 rounded-full text-gray-400 hover:bg-white/10 hover:text-white transition-colors"
                                >
                                    <EditIcon />
                                </button>
                            </div>
                        </div>
                        <p className="text-sm text-gray-300 mt-2 mb-3">{goal.payload?.details || ''}</p>
                        
                        {valueObjects.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-3">
                                {valueObjects.map(v => (
                                    v && <span key={v.id} className="px-2 py-0.5 text-xs bg-accent-color/20 text-accent-color rounded-full">{v.value}</span>
                                ))}
                            </div>
                        )}

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

export default GoalListWithPinning;