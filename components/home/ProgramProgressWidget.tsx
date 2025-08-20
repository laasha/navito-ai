

import React, { useMemo } from 'react';
import dayjs from 'dayjs';
import { Program } from '../../types';
import { useModal } from '../../context/ModalContext';
import ProgramCheckinModal from '../programs/ProgramCheckinModal';

const ProgramComponentIcon: React.FC<{ type: string }> = ({ type }) => {
    switch (type) {
        case 'habit': return <span title="Habit" className="text-lg">🏃‍♂️</span>;
        case 'goal': return <span title="Goal" className="text-lg">🎯</span>;
        case 'exercise': return <span title="Exercise" className="text-lg">🧘</span>;
        default: return null;
    }
};


const ProgramProgressWidget: React.FC<{ program: Program }> = ({ program }) => {
    const { openModal } = useModal();

    const currentWeek = useMemo(() => {
        const start = dayjs(program.startDate);
        const now = dayjs();
        const week = now.diff(start, 'week') + 1;
        return Math.min(week, program.durationWeeks); // Cap at max duration
    }, [program.startDate, program.durationWeeks]);

    const weekComponents = useMemo(() => {
        return program.components.filter(c => c.week === currentWeek);
    }, [program.components, currentWeek]);
    
    const overallProgress = (currentWeek / program.durationWeeks) * 100;

    const needsCheckin = useMemo(() => {
        const endOfCurrentWeek = dayjs(program.startDate).add(currentWeek, 'week');
        return dayjs().isAfter(endOfCurrentWeek) && !program.checkins.some(c => c.week === currentWeek);
    }, [program, currentWeek]);
    
    const handleCheckin = () => {
        openModal(<ProgramCheckinModal program={program} week={currentWeek} />);
    };

    return (
        <div className="glass-effect rounded-xl p-6">
            <div className="flex flex-wrap justify-between items-center gap-2 mb-4">
                <div>
                    <p className="text-sm font-semibold uppercase tracking-wider text-gray-400">აქტიური პროგრამა</p>
                    <h2 className="text-2xl font-bold brand-text">{program.name}</h2>
                </div>
                 {needsCheckin && (
                    <button onClick={handleCheckin} className="px-4 py-2 bg-accent-color text-white rounded-lg font-semibold animate-pulse">
                        შეაფასე კვირა {currentWeek}
                    </button>
                )}
            </div>
            
            <div className="mb-4">
                <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-300">პროგრესი (კვირა {currentWeek}/{program.durationWeeks})</span>
                    <span className="text-sm font-medium text-gray-300">{Math.round(overallProgress)}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2.5">
                    <div className="bg-accent-color h-2.5 rounded-full transition-all duration-500" style={{ width: `${overallProgress}%` }}></div>
                </div>
            </div>

            <div>
                <h3 className="font-semibold text-lg text-gray-200 mb-2">ამ კვირის ფოკუსი:</h3>
                <div className="space-y-2">
                    {weekComponents.length > 0 ? weekComponents.map((component, index) => (
                        <div key={index} className="flex items-start gap-3 p-2 bg-black/20 rounded">
                           <ProgramComponentIcon type={component.type} />
                            <div>
                                <p className="font-semibold">{component.title}</p>
                                <p className="text-xs text-gray-400">{component.details}</p>
                            </div>
                        </div>
                    )) : (
                        <p className="text-sm text-gray-500">ამ კვირისთვის კომპონენტები არ არის.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProgramProgressWidget;