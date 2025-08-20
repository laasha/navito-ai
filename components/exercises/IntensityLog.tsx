
import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import ExerciseWrapper from './ExerciseWrapper';
import { useAppContext } from '../../context/AppContext';
import { LifeItem } from '../../types';

const IntensityLog: React.FC = () => {
    const { addOrUpdateLifeItem, findLatestExerciseItem } = useAppContext();
    const [intensity, setIntensity] = useState(0);

    const initialData = findLatestExerciseItem('intensity-log');

    useEffect(() => {
        if (initialData?.payload && dayjs(initialData.dateISO).isSame(dayjs(), 'day')) {
            setIntensity(Number(initialData.payload.intensity) || 0);
        }
    }, [initialData]);

    const handleSave = async () => {
        const todayISO = dayjs().toISOString();
        await addOrUpdateLifeItem({
            id: (initialData && dayjs(initialData.dateISO).isSame(dayjs(), 'day')) ? initialData.id : undefined,
            type: 'exercise',
            title: `დღის ინტენსივობა: ${intensity}`,
            dateISO: todayISO,
            category: 'personal',
            payload: { 
                slug: 'intensity-log', 
                intensity,
            },
        });
    };

    const handleReset = () => {
        setIntensity(0);
    };
    
    const intensityLabels: { [key: number]: string } = {
        '-5': 'გადაწვა', '-3': 'მაღალი სტრესი', '0': 'ნეიტრალური', '3': 'ენერგიული', '5': 'Flow'
    };
    const getIntensityLabel = (value: number) => {
        return intensityLabels[value] || 'საშუალო';
    };

    return (
        <ExerciseWrapper
            slug="intensity-log"
            title="დღის ინტენსივობის ლოგი"
            description="შეაფასეთ თქვენი დღევანდელი სტრესის/ენერგიის დონე."
            initialData={initialData}
            gatherData={() => ({ intensity })}
            onSave={handleSave}
            onReset={handleReset}
        >
            <div className="space-y-4 text-center">
                 <label className="block text-sm font-medium text-gray-300 mb-2">
                    ინტენსივობა: <span className="font-bold brand-text">{getIntensityLabel(intensity)} ({intensity})</span>
                </label>
                <input
                    type="range"
                    min="-5"
                    max="5"
                    value={intensity}
                    onChange={e => setIntensity(parseInt(e.target.value))}
                    className="w-full accent-accent-color"
                />
            </div>
        </ExerciseWrapper>
    );
};

export default IntensityLog;