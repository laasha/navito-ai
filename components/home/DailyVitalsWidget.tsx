import React, { useMemo } from 'react';
import { useAppContext } from '../../context/AppContext';
import dayjs from 'dayjs';

const TrendIndicator: React.FC<{ change: number | null }> = ({ change }) => {
    if (change === null || change === 0) return <span className="text-gray-500">-</span>;
    const isUp = change > 0;
    return (
        <span className={`flex items-center text-xs ${isUp ? 'text-green-400' : 'text-red-400'}`}>
            {isUp ? '▲' : '▼'}
            {Math.abs(change).toFixed(1)}
        </span>
    );
};

const DailyVitalsWidget: React.FC = () => {
    const { biometricData, syncWearableData } = useAppContext();

    const { todayData, yesterdayData } = useMemo(() => {
        const todayStr = dayjs().format('YYYY-MM-DD');
        const yesterdayStr = dayjs().subtract(1, 'day').format('YYYY-MM-DD');
        return {
            todayData: biometricData.find(d => d.dateISO === todayStr) || biometricData[biometricData.length - 1],
            yesterdayData: biometricData.find(d => d.dateISO === yesterdayStr),
        };
    }, [biometricData]);
    
    // Note: Sleep data is for the previous night.
    const sleepData = yesterdayData; 
    const prevSleepData = biometricData.find(d => d.dateISO === dayjs().subtract(2, 'day').format('YYYY-MM-DD'));

    const sleepChange = sleepData && prevSleepData ? sleepData.sleepHours - prevSleepData.sleepHours : null;
    const heartChange = todayData && yesterdayData ? todayData.avgHeartRate - yesterdayData.avgHeartRate : null;
    const stepsChange = todayData && yesterdayData ? todayData.steps - yesterdayData.steps : null;


    if (!todayData) {
        return (
            <div className="glass-effect rounded-xl p-4 h-full flex items-center justify-center">
                <p className="text-sm text-gray-500">ბიომეტრიული მონაცემები მიუწვდომელია.</p>
            </div>
        );
    }
    
    return (
        <div className="glass-effect rounded-xl p-4 h-full">
            <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-semibold accent-text">დღის მონაცემები 💓</h3>
                 <button onClick={syncWearableData} className="text-xs text-gray-400 hover:text-white" title="სინქრონიზაცია">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h5M20 20v-5h-5M4 4l1.5 1.5A9 9 0 0120.5 18"></path></svg>
                 </button>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                    <div className="text-xl font-bold">💤 {sleepData?.sleepHours.toFixed(1) || 'N/A'}</div>
                    <div className="text-xs text-gray-400">ძილი (სთ)</div>
                    <TrendIndicator change={sleepChange} />
                </div>
                 <div>
                    <div className="text-xl font-bold">❤️ {todayData.avgHeartRate}</div>
                    <div className="text-xs text-gray-400">პულსი</div>
                    <TrendIndicator change={heartChange ? -heartChange : null} />
                </div>
                 <div>
                    <div className="text-xl font-bold">👟 {Math.round(todayData.steps/1000)}k</div>
                    <div className="text-xs text-gray-400">ნაბიჯი</div>
                    <TrendIndicator change={stepsChange} />
                </div>
            </div>
        </div>
    );
};

export default DailyVitalsWidget;