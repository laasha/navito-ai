import React from 'react';
import { LifeItemType } from '../../types';

interface WaveformControlsProps {
    visibleTypes: Set<LifeItemType>;
    setVisibleTypes: React.Dispatch<React.SetStateAction<Set<LifeItemType>>>;
}

const CONTROLS: { type: LifeItemType, label: string, icon: string }[] = [
    { type: 'event', label: 'მოვლენები', icon: '📌' },
    { type: 'goal', label: 'მიზნები', icon: '🎯' },
    { type: 'exercise', label: 'სავარჯიშოები', icon: '🧘' }
];

const WaveformControls: React.FC<WaveformControlsProps> = ({ visibleTypes, setVisibleTypes }) => {
    
    const handleToggle = (type: LifeItemType) => {
        setVisibleTypes(prev => {
            const newSet = new Set(prev);
            if (newSet.has(type)) {
                newSet.delete(type);
            } else {
                newSet.add(type);
            }
            return newSet;
        });
    };

    return (
        <div className="flex items-center space-x-2 glass-effect p-1 rounded-lg">
            {CONTROLS.map(({ type, label, icon }) => (
                <button
                    key={type}
                    onClick={() => handleToggle(type)}
                    className={`px-3 py-1 text-sm rounded-md transition-colors ${visibleTypes.has(type) ? 'bg-brand-color text-black font-semibold' : 'bg-transparent text-gray-300 hover:bg-white/10'}`}
                    title={label}
                >
                    {icon} <span className="hidden sm:inline-block ml-1">{label}</span>
                </button>
            ))}
        </div>
    );
};

export default WaveformControls;