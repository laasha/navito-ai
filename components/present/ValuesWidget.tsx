
import React, { useMemo } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Link } from 'react-router-dom';
import { CoreValue } from '../../types';

const shuffleArray = <T,>(array: T[]): T[] => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
};

const ValuesWidget: React.FC = () => {
    const { userSettings } = useAppContext();
    const values = userSettings.values || [];

    const displayedValues = useMemo(() => {
        if (!values || values.length === 0) return [];
        return shuffleArray(values).slice(0, 3);
    }, [values]);
    
    return (
        <div>
            <div className="flex justify-between items-center mb-2">
                 <h3 className="text-lg font-semibold accent-text">ჩემი ღირებულებები 🌟</h3>
            </div>
            <div className="bg-black/20 p-3 rounded-lg min-h-[100px]">
                {displayedValues.length > 0 ? (
                    <div className="space-y-2">
                        {displayedValues.map((value, index) => (
                            <div key={index}>
                                <p className="font-semibold text-brand-color">{value.value}</p>
                                <p className="text-xs text-gray-400 italic">"{value.reason}"</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center p-4">
                        <p className="text-sm text-gray-400 mb-3">განსაზღვრეთ თქვენი მთავარი ღირებულებები, რათა თქვენი ქმედებები მათ შეესაბამებოდეს.</p>
                        <Link to="/future" className="p-2 bg-accent-color text-white rounded-lg text-sm font-semibold">
                            სავარჯიშოს შესრულება
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ValuesWidget;
