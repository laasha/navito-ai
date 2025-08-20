
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAppContext } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { generateLifeWheelAnalysis } from '../../services/geminiService';
import { LifeWheelAnalysis, LifeItem } from '../../types';
import dayjs from 'dayjs';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

const LifeWheelEvolution: React.FC = () => {
    const { lifeItems } = useAppContext();
    const { addToast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<LifeWheelAnalysis | null>(null);
    const [lifeWheelEntries, setLifeWheelEntries] = useState<LifeItem[]>([]);
    const chartInstanceRef = useRef<Chart | null>(null);
    const chartRef = useRef<HTMLCanvasElement>(null);

    const handleAnalyze = useCallback(async () => {
        const entries = lifeItems
            .filter(i => i.payload?.slug === 'life-wheel' && i.payload.areas)
            .sort((a, b) => dayjs(b.dateISO).valueOf() - dayjs(a.dateISO).valueOf());
        
        setLifeWheelEntries(entries);
        
        if (entries.length < 2) {
            addToast('ანალიზისთვის საჭიროა მინიმუმ ორი "ცხოვრების ბორბლის" ჩანაწერი.', 'info');
            return;
        }
        
        setIsLoading(true);
        setResult(null);
        try {
            const latest = entries[0].payload.areas;
            const previous = entries[1].payload.areas;
            const dataSummary = `Latest data from ${entries[0].dateISO}: ${JSON.stringify(latest)}. Previous data from ${entries[1].dateISO}: ${JSON.stringify(previous)}`;
            const analysis = await generateLifeWheelAnalysis(dataSummary);
            setResult(analysis);
        } catch (error: any) {
            addToast(error.message, 'error');
        } finally {
            setIsLoading(false);
        }
    }, [lifeItems, addToast]);

    useEffect(() => {
        handleAnalyze();
    }, []);

    useEffect(() => {
        if (chartRef.current && result && lifeWheelEntries.length >= 2) {
            if (chartInstanceRef.current) chartInstanceRef.current.destroy();
            const ctx = chartRef.current.getContext('2d');
            if (ctx) {
                chartInstanceRef.current = new Chart(ctx, {
                    type: 'radar',
                    data: {
                        labels: result.trends.map(t => t.area),
                        datasets: [{
                            label: `წინა (${dayjs(lifeWheelEntries[1].dateISO).format('MMM YYYY')})`,
                            data: result.trends.map(t => t.startValue),
                            borderColor: 'rgba(255, 46, 209, 0.5)',
                            backgroundColor: 'rgba(255, 46, 209, 0.1)',
                        }, {
                            label: `ბოლო (${dayjs(lifeWheelEntries[0].dateISO).format('MMM YYYY')})`,
                            data: result.trends.map(t => t.endValue),
                            borderColor: 'rgba(0, 246, 255, 1)',
                            backgroundColor: 'rgba(0, 246, 255, 0.2)',
                        }]
                    },
                    options: { maintainAspectRatio: false, scales: { r: { suggestedMin: 0, suggestedMax: 10, pointLabels: { color: 'var(--text-color)' }, ticks: { backdropColor: 'transparent', color: 'var(--text-color)' }, grid: { color: 'rgba(255,255,255,0.2)' } } } }
                });
            }
        }
        return () => chartInstanceRef.current?.destroy();
    }, [result, lifeWheelEntries]);

    return (
        <div className="glass-effect rounded-xl p-6">
            <h3 className="text-xl font-semibold">"ცხოვრების ბორბლის" ევოლუცია ☸️</h3>
             <p className="text-sm text-gray-400 mb-4">შეადარეთ თქვენი ბოლო ორი შეფასება და ნახეთ პროგრესი დინამიკაში.</p>

            {isLoading && <div className="text-center p-8"><span className="loader"></span></div>}
            
            {!isLoading && lifeWheelEntries.length < 2 && (
                <div className="text-center py-4 text-gray-500">
                    <p>ანალიზისთვის საჭიროა მინიმუმ 2 შევსებული "ცხოვრების ბორბალი".</p>
                </div>
            )}

            {result && (
                <div className="animate-fade-in space-y-4">
                    <div className="h-64 w-full">
                        <canvas ref={chartRef}></canvas>
                    </div>
                     <div className="border-t border-white/10 pt-3">
                        <h4 className="font-semibold text-brand-color">AI ნარატივი:</h4>
                        <p className="text-sm italic text-gray-300">"{result.narrativeSummary}"</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LifeWheelEvolution;
