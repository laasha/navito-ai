

import React, { useState, useEffect, useRef } from 'react';
import dayjs from 'dayjs';
import ExerciseWrapper from './ExerciseWrapper';
import { useAppContext } from '../../context/AppContext';
import { LifeItem, Area } from '../../types';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

interface LifeWheelData {
    areas: Area[];
    insight: string;
}

const defaultAreas: Area[] = [
    {name:'კარიერა',value:5},{name:'ფინანსები',value:5},{name:'ჯანმრთელობა',value:5},{name:'ურთიერთობები',value:5},
    {name:'პირადი ზრდა',value:5},{name:'გართობა',value:5},{name:'გარემო',value:5},{name:'სულიერება',value:5}
];

function isAreaArray(value: any): value is Area[] {
    return Array.isArray(value) && value.every(item =>
        typeof item === 'object' && item !== null && 'name' in item && 'value' in item
    );
}

const LifeWheel: React.FC<{ initialData: LifeItem | null }> = ({ initialData }) => {
    const { addOrUpdateLifeItem } = useAppContext();
    const [data, setData] = useState<LifeWheelData>({ areas: defaultAreas, insight: '' });
    const chartRef = useRef<HTMLCanvasElement>(null);
    const chartInstanceRef = useRef<Chart | null>(null);

    useEffect(() => {
        if (initialData?.payload?.areas && isAreaArray(initialData.payload.areas)) {
            setData({
                areas: initialData.payload.areas,
                insight: String(initialData.payload.insight || ''),
            });
        }
    }, [initialData]);

    useEffect(() => {
        if (chartRef.current) {
            if (chartInstanceRef.current) {
                chartInstanceRef.current.destroy();
            }
            const ctx = chartRef.current.getContext('2d');
            if(ctx) {
                chartInstanceRef.current = new Chart(ctx, {
                    type: 'radar',
                    data: {
                        labels: data.areas.map(a => a.name),
                        datasets: [{
                            label: 'ცხოვრების ბორბალი', data: data.areas.map(a => a.value), fill: true,
                            backgroundColor: 'rgba(0, 246, 255, 0.2)', borderColor: 'rgb(0, 246, 255)',
                            pointBackgroundColor: 'rgb(0, 246, 255)'
                        }]
                    },
                    options: { maintainAspectRatio: false, scales: { r: { suggestedMin: 0, suggestedMax: 10, pointLabels: { color: 'var(--text-color)' }, ticks: { backdropColor: 'transparent', color: 'var(--text-color)' }, grid: { color: 'rgba(255,255,255,0.2)' } } } }
                });
            }
        }
        return () => {
            if (chartInstanceRef.current) {
                chartInstanceRef.current.destroy();
            }
        };
    }, [data.areas]);

    const handleSliderChange = (index: number, value: number) => {
        const newAreas = [...data.areas];
        newAreas[index].value = value;
        setData(prev => ({ ...prev, areas: newAreas }));
    };

    const handleSave = async (wheelData: LifeWheelData) => {
        await addOrUpdateLifeItem({
            id: initialData?.id || undefined,
            type: 'exercise',
            title: `ცხოვრების ბორბალი - ${dayjs().format('YYYY-MM-DD')}`,
            dateISO: dayjs().toISOString(),
            category: 'personal',
            payload: { slug: 'life-wheel', areas: wheelData.areas, insight: wheelData.insight },
        });
    };

    const handleReset = () => {
        setData({ areas: defaultAreas, insight: '' });
    };

    return (
        <ExerciseWrapper
            slug="life-wheel"
            title="ცხოვრების ბორბალი"
            description="შეაფასე კმაყოფილება ცხოვრების 8 მთავარ სფეროში."
            initialData={initialData}
            gatherData={() => data}
            onSave={() => handleSave(data)}
            onReset={handleReset}
        >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.areas.map((area, index) => (
                    <div key={index} className="mb-2">
                        <label className="block text-sm text-gray-300">{area.name}: <span className="font-bold">{area.value}</span></label>
                        <input type="range" min="1" max="10" value={area.value} onChange={e => handleSliderChange(index, parseInt(e.target.value))} className="w-full accent-brand-color" />
                    </div>
                ))}
            </div>
            <div className="mt-4"><label className="block text-sm text-gray-300">შენიშვნები:</label><textarea value={data.insight} onChange={e => setData(prev => ({...prev, insight: e.target.value}))} className="w-full mt-1 p-2 bg-black/30 border-white/10 rounded-md h-20"></textarea></div>
            <div className="mt-4 h-64 w-full"><canvas ref={chartRef}></canvas></div>
        </ExerciseWrapper>
    );
};

export default LifeWheel;