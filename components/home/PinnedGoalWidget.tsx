
import React from 'react';
import { LifeItem } from '../../types';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useAppContext } from '../../context/AppContext';
import { useModal } from '../../context/ModalContext';
import LifeItemEditModal from '../LifeItemEditModal';

dayjs.extend(relativeTime);

const PinnedGoalWidget: React.FC<{ goal: LifeItem }> = ({ goal }) => {
    const { togglePinnedGoal } = useAppContext();
    const { openModal } = useModal();
    const { title, dateISO, payload, subtasks = [] } = goal;

    const completedCount = subtasks.filter(st => st.completed).length;
    const totalCount = subtasks.length;
    const percentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

    return (
        <div className="glass-effect rounded-xl p-6 h-full flex flex-col">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <p className="text-sm font-semibold uppercase tracking-wider text-gray-400">ამჟამინდელი ფოკუსი</p>
                    <h2 className="text-2xl font-bold brand-text">{title}</h2>
                    <p className="text-xs text-gray-500">ვადა: {dayjs(dateISO).format('YYYY-MM-DD')} ({dayjs(dateISO).fromNow()})</p>
                </div>
                <div className="flex items-center space-x-2">
                     <button 
                        onClick={() => openModal(<LifeItemEditModal itemToEdit={goal} />)}
                        className="p-2 rounded-full text-gray-400 hover:bg-white/10 hover:text-white transition-colors"
                        title="რედაქტირება"
                    >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828zM5 12V7a2 2 0 012-2h4.586a1 1 0 01.707.293l2.414 2.414a1 1 0 01.293.707V12a2 2 0 01-2 2h-7a2 2 0 01-2-2z"></path></svg>
                    </button>
                    <button 
                        onClick={() => togglePinnedGoal(goal.id)}
                        className="p-2 rounded-full bg-accent-color text-white"
                        title="ფოკუსის მოხსნა"
                    >
                         <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                    </button>
                </div>
            </div>

            {payload?.details && <p className="text-sm text-gray-300 mb-4 flex-grow">{payload.details}</p>}

            {totalCount > 0 && (
                <div>
                    <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-gray-300">პროგრესი</span>
                        <span className="text-sm font-medium text-gray-300">{completedCount}/{totalCount}</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2.5">
                        <div className="bg-brand-text h-2.5 rounded-full transition-all duration-500" style={{ width: `${percentage}%` }}></div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PinnedGoalWidget;
