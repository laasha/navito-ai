
import React from 'react';
import dayjs from 'dayjs';
import { useModal } from '../../context/ModalContext';
import WeeklyRitual from './WeeklyRitual';

const WeeklyRitualTrigger: React.FC = () => {
    const { openModal } = useModal();
    const today = dayjs().day(); // Sunday = 0, Monday = 1

    // Show the trigger only on Sunday or Monday
    if (today !== 0 && today !== 1) {
        return null;
    }

    const handleStart = () => {
        openModal(<WeeklyRitual />);
    };

    return (
        <div className="bg-gradient-to-r from-brand-color/20 to-accent-color/20 p-4 rounded-xl border border-white/10 text-center">
            <h3 className="text-lg font-semibold text-white">🗓️ კვირის დაგეგმვის დროა!</h3>
            <p className="text-sm text-gray-300 mt-1 mb-3">დაუთმეთ 5 წუთი გასული კვირის შესაფასებლად და მომდევნოს დასაგეგმად.</p>
            <button
                onClick={handleStart}
                className="px-4 py-2 bg-accent-color text-white rounded-lg font-semibold hover:bg-fuchsia-500 transition-colors"
            >
                რიტუალის დაწყება
            </button>
        </div>
    );
};

export default WeeklyRitualTrigger;
