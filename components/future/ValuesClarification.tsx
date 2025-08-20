
import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { clarifyCoreValues } from '../../services/geminiService';
import { CoreValue } from '../../types';

const ValuesClarification: React.FC = () => {
    const { userSettings, saveUserSettings } = useAppContext();
    const { addToast } = useToast();
    const [reflectionText, setReflectionText] = useState('');
    const [values, setValues] = useState<CoreValue[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        if (userSettings.values && userSettings.values.length > 0) {
            setValues(userSettings.values);
        }
    }, [userSettings.values]);

    const handleAnalyze = async () => {
        if (!reflectionText.trim()) {
            addToast('გთხოვთ, შეავსოთ ტექსტური ველი.', 'error');
            return;
        }
        setIsLoading(true);
        try {
            const result = await clarifyCoreValues(reflectionText);
            setValues(result.values);
            setIsEditing(true);
            addToast('თქვენი ღირებულებები იდენტიფიცირებულია!', 'success');
        } catch (error: any) {
            addToast(error.message, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleValueChange = (index: number, newValue: string) => {
        const updatedValues = [...values];
        updatedValues[index].value = newValue;
        setValues(updatedValues);
    };

    const handleRemoveValue = (id: string) => {
        setValues(values.filter((v) => v.id !== id));
    };

    const handleSave = async () => {
        const updatedSettings = { ...userSettings, values: values };
        await saveUserSettings(updatedSettings);
        addToast('ღირებულებები შენახულია!', 'success');
        setIsEditing(false);
    };

    const handleReset = () => {
        setReflectionText('');
        setValues(userSettings.values || []);
        setIsEditing(false);
        addToast('ფორმა გასუფთავდა', 'info');
    }

    return (
        <div className="glass-effect rounded-xl p-6 shadow-md">
            <h3 className="text-xl font-semibold brand-text">ღირებულებების განსაზღვრა</h3>
            <p className="text-sm text-gray-400 mt-1 mb-4">დაწერეთ თავისუფალი ტექსტი იმის შესახებ, თუ რა არის თქვენთვის ყველაზე მნიშვნელოვანი ცხოვრებაში. AI დაგეხმარებათ მთავარი ღირებულებების იდენტიფიცირებაში.</p>
            
            <textarea
                value={reflectionText}
                onChange={(e) => setReflectionText(e.target.value)}
                className="w-full p-2 bg-black/30 border-white/10 rounded-md h-32"
                placeholder="რა განიჭებთ სიხარულს? რითი ამაყობთ? რა არის თქვენთვის შეუცვლელი?"
                disabled={isLoading || (values.length > 0 && !isEditing)}
            />
            
            <div className="mt-3 flex gap-3">
                 <button onClick={handleAnalyze} disabled={isLoading || (values.length > 0 && !isEditing)} className="flex-1 p-2 bg-accent-color text-white rounded-lg disabled:opacity-50 flex items-center justify-center">
                    {isLoading && <span className="loader mr-2"></span>}
                    {isLoading ? 'ანალიზი...' : 'AI ანალიზი ✨'}
                </button>
                 <button onClick={handleReset} className="flex-1 p-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg">გასუფთავება ♻️</button>
            </div>
            
            {(values.length > 0) && (
                <div className="mt-6 animate-fade-in">
                    <h4 className="font-semibold mb-2">თქვენი მთავარი ღირებულებები:</h4>
                    <div className="space-y-3">
                        {values.map((v, index) => (
                            <div key={v.id} className="bg-black/20 p-3 rounded-lg">
                                <div className="flex justify-between items-center">
                                    {isEditing ? (
                                        <input 
                                            type="text"
                                            value={v.value}
                                            onChange={(e) => handleValueChange(index, e.target.value)}
                                            className="font-bold text-lg bg-transparent border-b border-dashed border-gray-500 focus:border-brand-color outline-none"
                                        />
                                    ) : (
                                        <p className="font-bold text-lg accent-text">{v.value}</p>
                                    )}
                                    {isEditing && (
                                        <button onClick={() => handleRemoveValue(v.id)} className="text-red-500 hover:text-red-400 text-2xl">&times;</button>
                                    )}
                                </div>
                                <p className="text-xs text-gray-400 italic mt-1">"{v.reason}"</p>
                            </div>
                        ))}
                    </div>
                    <div className="mt-4 flex gap-3">
                        {isEditing ? (
                            <button onClick={handleSave} className="w-full p-2 bg-green-600 hover:bg-green-500 text-white rounded-lg">შენახვა 💾</button>
                        ) : (
                            <button onClick={() => setIsEditing(true)} className="w-full p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg">რედაქტირება ✏️</button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ValuesClarification;