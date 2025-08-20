import React, { useState, useEffect, useCallback } from 'react';
import { useAppContext } from '../../context/AppContext';
import { analyzeMindBodyConnection } from '../../services/geminiService';
import dayjs from 'dayjs';

const MindBodyConnectionWidget: React.FC = () => {
    const { lifeItems, biometricData } = useAppContext();
    const [insight, setInsight] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const getInsight = useCallback(async () => {
        const moodItems = lifeItems.filter(i => i.mood !== 0 && dayjs(i.dateISO).isAfter(dayjs().subtract(30, 'days')));
        if (moodItems.length < 5 || biometricData.length < 7) {
            setIsLoading(false);
            setInsight("ანალიზისთვის საჭიროა მეტი მონაცემი (განწყობა და ბიომეტრია).");
            return;
        }

        setIsLoading(true);
        try {
            const bioMap = new Map(biometricData.map(d => [d.dateISO, d]));
            const dataSummary = moodItems.map(item => {
                const date = dayjs(item.dateISO).format('YYYY-MM-DD');
                const bio = bioMap.get(date);
                let text = `On ${date}, mood was ${item.mood}.`;
                if (bio) {
                    text += ` Sleep: ${bio.sleepHours}h, Steps: ${bio.steps}.`;
                }
                return text;
            }).join('; ');

            const result = await analyzeMindBodyConnection(dataSummary);
            setInsight(result.insight);
        } catch (error) {
            console.error("Failed to get mind-body insight:", error);
            setInsight("ინსაითის მიღებისას შეცდომა მოხდა.");
        } finally {
            setIsLoading(false);
        }
    }, [lifeItems, biometricData]);

    useEffect(() => {
        getInsight();
    }, [getInsight]);

    return (
        <div>
            <h3 className="text-lg font-semibold accent-text mb-2">გონება და სხეული 🧠⚡️</h3>
            <div className="bg-black/20 p-3 rounded-lg min-h-[70px]">
                {isLoading ? (
                    <div className="flex items-center text-sm text-gray-400">
                        <span className="loader mr-2"></span>
                        <span>კავშირების ანალიზი...</span>
                    </div>
                ) : (
                    <p className="text-sm text-gray-300 italic">"{insight}"</p>
                )}
            </div>
        </div>
    );
};

export default MindBodyConnectionWidget;