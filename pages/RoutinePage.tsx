
import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import MorningRoutine from '../components/routines/MorningRoutine';
import EveningRoutine from '../components/routines/EveningRoutine';

const RoutinePage: React.FC = () => {
    const { type } = useParams<{ type: 'morning' | 'evening' }>();
    const { setIsRoutineMode } = useAppContext();
    const navigate = useNavigate();

    useEffect(() => {
        setIsRoutineMode(true);
        // Cleanup function to exit routine mode when the component unmounts
        return () => {
            setIsRoutineMode(false);
        };
    }, [setIsRoutineMode]);
    
    const handleExit = () => {
        navigate('/dashboard');
    };

    return (
        <div className="fixed inset-0 bg-base-color z-[200] flex items-center justify-center p-4 sm:p-8">
            <div className="w-full max-w-2xl mx-auto">
                {type === 'morning' && <MorningRoutine onExit={handleExit} />}
                {type === 'evening' && <EveningRoutine onExit={handleExit} />}
            </div>
        </div>
    );
};

export default RoutinePage;
