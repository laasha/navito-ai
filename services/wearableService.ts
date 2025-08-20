
import dayjs from 'dayjs';
import { BiometricData } from '../types';

// Mock function to generate semi-realistic biometric data
export const fetchMockWearableData = async (): Promise<BiometricData[]> => {
    const data: BiometricData[] = [];
    let currentDate = dayjs().subtract(90, 'days');
    const today = dayjs();

    while (currentDate.isBefore(today) || currentDate.isSame(today, 'day')) {
        const dateISO = currentDate.format('YYYY-MM-DD');

        // Simulate weekly patterns and some randomness
        const dayOfWeek = currentDate.day(); // 0=Sun, 6=Sat
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

        const sleepBase = isWeekend ? 8 : 6.5;
        const sleepHours = parseFloat((sleepBase + (Math.random() * 2 - 1)).toFixed(1));

        const heartRateBase = 70;
        const heartRate = Math.round(heartRateBase - (sleepHours - 7) * 5 + (Math.random() * 6 - 3));

        const stepsBase = isWeekend ? 10000 : 5000;
        const steps = Math.round(stepsBase + (Math.random() * 4000 - 2000));
        
        data.push({
            dateISO,
            sleepHours,
            avgHeartRate: heartRate,
            steps
        });

        currentDate = currentDate.add(1, 'day');
    }

    return Promise.resolve(data);
};
