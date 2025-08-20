
import React, { useState, useEffect } from 'react';
import ExerciseWrapper from './ExerciseWrapper';
import { useAppContext } from '../../context/AppContext';
import { LifeItem } from '../../types';
import dayjs from 'dayjs';

interface SwotData {
    strengths: string;
    weaknesses: string;
    opportunities: string;
    threats: string;
}

const SwotAnalysis: React.FC<{ initialData: LifeItem | null }> = ({ initialData }) => {
    const { addOrUpdateLifeItem } = useAppContext();
    const [data, setData] = useState<SwotData>({ strengths: '', weaknesses: '', opportunities: '', threats: '' });

    useEffect(() => {
        if (initialData?.payload) {
            setData({
                strengths: String(initialData.payload.strengths || ''),
                weaknesses: String(initialData.payload.weaknesses || ''),
                opportunities: String(initialData.payload.opportunities || ''),
                threats: String(initialData.payload.threats || ''),
            });
        }
    }, [initialData]);

    const handleChange = (field: keyof SwotData, value: string) => {
        setData(prev => ({ ...prev, [field]: value }));
    };
    
    const handleSave = async (swotData: SwotData) => {
        await addOrUpdateLifeItem({
            id: initialData?.id || undefined,
            type: 'exercise',
            title: `SWOT ანალიზი - ${dayjs().format('YYYY-MM-DD')}`,
            dateISO: dayjs().toISOString(),
            category: 'personal',
            payload: { 
                slug: 'swot-me', 
                ...swotData
            },
        });
    };
    
    const handleReset = () => {
        setData({ strengths: '', weaknesses: '', opportunities: '', threats: '' });
    };

    return (
        <ExerciseWrapper
            slug="swot-me"
            title="SWOT ანალიზი"
            description="შეაფასე შენი ძლიერი/სუსტი მხარეები, შესაძლებლობები/საფრთხეები."
            initialData={initialData}
            gatherData={() => data}
            onSave={() => handleSave(data)}
            onReset={handleReset}
        >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-green-400 mb-1">ძლიერი მხარეები (Strengths):</label>
                    <textarea value={data.strengths} onChange={e => handleChange('strengths', e.target.value)} className="w-full p-2 bg-black/30 border-white/10 rounded-md h-32"></textarea>
                </div>
                <div>
                    <label className="block text-sm font-medium text-red-400 mb-1">სუსტი მხარეები (Weaknesses):</label>
                    <textarea value={data.weaknesses} onChange={e => handleChange('weaknesses', e.target.value)} className="w-full p-2 bg-black/30 border-white/10 rounded-md h-32"></textarea>
                </div>
                <div>
                    <label className="block text-sm font-medium text-blue-400 mb-1">შესაძლებლობები (Opportunities):</label>
                    <textarea value={data.opportunities} onChange={e => handleChange('opportunities', e.target.value)} className="w-full p-2 bg-black/30 border-white/10 rounded-md h-32"></textarea>
                </div>
                <div>
                    <label className="block text-sm font-medium text-yellow-400 mb-1">საფრთხეები (Threats):</label>
                    <textarea value={data.threats} onChange={e => handleChange('threats', e.target.value)} className="w-full p-2 bg-black/30 border-white/10 rounded-md h-32"></textarea>
                </div>
            </div>
        </ExerciseWrapper>
    );
};

export default SwotAnalysis;
