import React, { useEffect, useState, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import dayjs from 'dayjs';
import { useAppContext } from '../context/AppContext';
import { generatePrintableSummary } from '../services/geminiService';
import { LifeItem } from '../types';

function useQuery() {
    return new URLSearchParams(useLocation().search);
}

const PrintableTimelinePage: React.FC = () => {
    const { lifeItems, userSettings, isLoading } = useAppContext();
    const query = useQuery();
    const centerDate = dayjs(query.get('centerDate'));
    const zoomLevel = parseInt(query.get('zoomLevel') || '2', 10);
    const [summary, setSummary] = useState('');
    const [isSummaryLoading, setIsSummaryLoading] = useState(true);

    const ZOOM_LEVELS = [{ durationDays: 1 }, { durationDays: 7 }, { durationDays: 30 }, { durationDays: 365 }, { durationDays: 365 * 80 }];
    const viewDuration = ZOOM_LEVELS[zoomLevel].durationDays;
    const startDate = centerDate.subtract(viewDuration / 2, 'day');
    const endDate = centerDate.add(viewDuration / 2, 'day');

    const itemsInRange = useMemo(() => {
        return lifeItems
            .filter(item => dayjs(item.dateISO).isBetween(startDate, endDate))
            .sort((a, b) => dayjs(a.dateISO).valueOf() - dayjs(b.dateISO).valueOf());
    }, [lifeItems, startDate, endDate]);

    useEffect(() => {
        if (!isLoading) {
            generatePrintableSummary(itemsInRange)
                .then(setSummary)
                .catch(console.error)
                .finally(() => setIsSummaryLoading(false));
        }
    }, [itemsInRange, isLoading]);

    useEffect(() => {
        if (!isLoading && !isSummaryLoading) {
            window.print();
        }
    }, [isLoading, isSummaryLoading]);

    if (isLoading) {
        return <div className="p-8">იტვირთება...</div>;
    }

    const getPinColor = (item: LifeItem) => {
        const category = userSettings.categories.find(c => c.id === item.category);
        return category ? category.color : '#00F6FF';
    };

    return (
        <div className="bg-white text-black p-8 font-sans printable-content">
            <style>
                {`
                @media print {
                    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                    .no-print { display: none; }
                }
                `}
            </style>
            <div className="no-print text-center mb-4">
                <p>თქვენი დოკუმენტი მზად არის. თუ ბეჭდვის დიალოგი ავტომატურად არ გაიხსნა, დააჭირეთ Ctrl/Cmd + P.</p>
            </div>
            <h1 className="text-3xl font-bold mb-2">Life-Line მიმოხილვა</h1>
            <p className="text-gray-600 mb-6">პერიოდი: {startDate.format('DD MMM YYYY')} - {endDate.format('DD MMM YYYY')}</p>

            <div className="mb-8">
                <h2 className="text-xl font-semibold border-b-2 border-gray-300 pb-2 mb-4">AI შეჯამება</h2>
                {isSummaryLoading ? <p>იტვირთება...</p> : <p className="text-gray-700 whitespace-pre-wrap">{summary}</p>}
            </div>

            <div className="mb-8">
                <h2 className="text-xl font-semibold border-b-2 border-gray-300 pb-2 mb-4">მთავარი მოვლენები</h2>
                <div className="space-y-4">
                    {itemsInRange.map(item => (
                        <div key={item.id} className="flex items-start gap-4">
                            <div className="w-28 text-right text-gray-500 text-sm flex-shrink-0">{dayjs(item.dateISO).format('DD MMM YYYY')}</div>
                            <div className="relative w-full border-l-2 border-gray-200 pl-8 pb-4">
                                <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full border-4 border-white" style={{ backgroundColor: getPinColor(item) }}></div>
                                <p className="font-semibold">{item.title} <span className="text-xs text-gray-400">({item.type})</span></p>
                                {item.payload.details && <p className="text-sm text-gray-600">{item.payload.details.substring(0, 150)}...</p>}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default PrintableTimelinePage;