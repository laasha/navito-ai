
import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import { Link } from 'react-router-dom';

const RoutineTriggers: React.FC = () => {
    const [timeOfDay, setTimeOfDay] = useState<'morning' | 'evening' | null>(null);

    useEffect(() => {
        const hour = dayjs().hour();
        if (hour >= 5 && hour < 10) {
            setTimeOfDay('morning');
        } else if (hour >= 20 && hour < 24) {
            setTimeOfDay('evening');
        } else {
            setTimeOfDay(null);
        }
    }, []);

    if (!timeOfDay) {
        return null;
    }

    if (timeOfDay === 'morning') {
        return (
            <div className="bg-gradient-to-r from-brand-color/20 to-accent-color/20 p-4 rounded-xl border border-white/10 text-center">
                <h3 className="text-lg font-semibold text-white">☀️ დილა მშვიდობის!</h3>
                <p className="text-sm text-gray-300 mt-1 mb-3">დაიწყეთ დღე სწორად. დაუთმეთ 2 წუთი დღის განწყობის შექმნას.</p>
                <Link 
                    to="/routine/morning"
                    className="px-4 py-2 bg-brand-color text-black rounded-lg font-semibold hover:bg-brand-color/80 transition-colors"
                >
                    დილის რიტუალის დაწყება
                </Link>
            </div>
        );
    }
    
     if (timeOfDay === 'evening') {
        return (
            <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 p-4 rounded-xl border border-white/10 text-center">
                <h3 className="text-lg font-semibold text-white">🌙 საღამოს შეჯამება</h3>
                <p className="text-sm text-gray-300 mt-1 mb-3">დახურეთ დღე მშვიდად. დაუთმეთ 5 წუთი რეფლექსიას და გონების გასუფთავებას.</p>
                 <Link 
                    to="/routine/evening"
                    className="px-4 py-2 bg-accent-color text-white rounded-lg font-semibold hover:bg-fuchsia-500 transition-colors"
                >
                    საღამოს რიტუალის დაწყება
                </Link>
            </div>
        );
    }

    return null;
};

export default RoutineTriggers;
