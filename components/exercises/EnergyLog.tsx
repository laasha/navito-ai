
import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import ExerciseWrapper from './ExerciseWrapper';
import { useAppContext } from '../../context/AppContext';
import { LifeItem } from '../../types';

interface EnergyData {
    morning: number;
    afternoon: number;
    evening: number;
}

const EnergyLog: React.FC<{ initialData: LifeItem | null }> = ({ initialData }) => {
    const { addOrUpdateLifeItem } = useAppContext();
    const [data, setData] = useState<EnergyData>({ morning: 0, afternoon: 0, evening: 0 });

    useEffect(() => {
        // Ensure we only load data if it's for today
        if (initialData?.payload && dayjs(initialData.dateISO).isSame(dayjs(), 'day')) {
            setData({
                morning: Number(initialData.payload.morning) || 0,
                afternoon: Number(initialData.payload.afternoon) || 0,
                evening: Number(initialData.payload.evening) || 0,
            });
        }
    }, [initialData]);
    
    const handleChange = (period: keyof EnergyData, value: number) => {
        setData(prev => ({...prev, [period]: value}));
    };

    const handleSave = async (energyData: EnergyData) => {
        // Always save with today's date
        const todayISO = dayjs().toISOString();
        await addOrUpdateLifeItem({
            id: initialData?.id || undefined,
            type: 'exercise',
            title: `ენერგიის დონე - ${dayjs().format('YYYY-MM-DD')}`,
            dateISO: todayISO,
            category: 'personal',
            payload: { 
                slug: 'energy-log', 
                ...energyData
            },
        });
    };

    const handleReset = () => {
        setData({ morning: 0, afternoon: 0, evening: 0 });
    };

    const EnergySelector: React.FC<{ period: keyof EnergyData, label: string }> = ({ period, label }) => (
        <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">{label}</label>
            <div className="flex justify-between items-center space-x-2">
                {[1, 2, 3, 4, 5].map(value => (
                    <button 
                        key={value}
                        onClick={() => handleChange(period, value)}
                        className={`w-8 h-8 rounded-full border-2 transition-all ${data[period] === value ? 'bg-brand-color border-brand-color scale-110' : 'bg-black/30 border-white/10 hover:border-brand-color'}`}
                        aria-label={`${label} level ${value}`}
                    >
                       <span className={data[period] === value ? 'text-black font-bold' : 'text-gray-400'}>{value}</span>
                    </button>
                ))}
            </div>
        </div>
    );

    return (
        <ExerciseWrapper
            slug="energy-log"
            title="ენერგიის დონის დღიური"
            description="შეაფასე შენი ფიზიკური და მენტალური ენერგია დღის განმავლობაში."
            initialData={initialData}
            gatherData={() => data}
            onSave={() => handleSave(data)}
            onReset={handleReset}
        >
            <div className="space-y-6">
                <EnergySelector period="morning" label="☀️ დილა" />
                <EnergySelector period="afternoon" label="🏙️ შუადღე" />
                <EnergySelector period="evening" label="🌙 საღამო" />
            </div>
        </ExerciseWrapper>
    );
};

export default EnergyLog;
