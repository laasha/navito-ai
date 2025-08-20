
import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import { useAppContext } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { generateEveningReflectionPrompt } from '../../services/geminiService';
import DailyLog from '../exercises/DailyLog';
import EnergyLog from '../exercises/EnergyLog';

const EveningRoutine: React.FC<{ onExit: () => void }> = ({ onExit }) => {
    const { lifeItems, habits, findLatestExerciseItem, addOrUpdateLifeItem } = useAppContext();
    const { addToast } = useToast();
    const [step, setStep] = useState(0);
    const [isLoadingPrompt, setIsLoadingPrompt] = useState(true);
    const [reflectionPrompt, setReflectionPrompt] = useState('');
    const [reflectionAnswer, setReflectionAnswer] = useState('');
    const [brainDump, setBrainDump] = useState('');

    const dailyLogData = findLatestExerciseItem('daily-log');
    const energyLogData = findLatestExerciseItem('energy-log');
    
    useEffect(() => {
        if (step === 1) { // When moving to reflection step
            const today = dayjs();
            const todayString = today.format('YYYY-MM-DD');
            const todayItems = lifeItems.filter(item => dayjs(item.dateISO).isSame(today, 'day'));
            const completedHabits = habits.filter(h => h.log.includes(todayString)).map(h => h.name);
            let summary = `დღეს შესრულდა ჩვევები: ${completedHabits.join(', ') || 'არცერთი'}. მოვლენები: ${todayItems.map(i => i.title).join(', ')}`;
            
            generateEveningReflectionPrompt(summary)
                .then(setReflectionPrompt)
                .catch(console.error)
                .finally(() => setIsLoadingPrompt(false));
        }
    }, [step, lifeItems, habits]);
    
    const handleSaveAndExit = async () => {
        try {
            const promises = [];
            if (reflectionAnswer.trim()) {
                promises.push(addOrUpdateLifeItem({
                    type: 'exercise',
                    title: `საღამოს რეფლექსია: ${dayjs().format('YYYY-MM-DD')}`,
                    dateISO: dayjs().toISOString(),
                    payload: { slug: 'evening-reflection', question: reflectionPrompt, answer: reflectionAnswer },
                }));
            }
            if (brainDump.trim()) {
                 promises.push(addOrUpdateLifeItem({
                    type: 'event',
                    title: `იდეები საღამოს რიტუალიდან`,
                    dateISO: dayjs().toISOString(),
                    payload: { slug: 'brain-dump', details: brainDump },
                }));
            }
            await Promise.all(promises);
            addToast('საღამოს ჩანაწერები შენახულია!', 'success');
        } catch (error) {
            addToast('შენახვისას მოხდა შეცდომა', 'error');
        } finally {
            onExit();
        }
    };

    const renderStep = () => {
        switch (step) {
            case 0:
                return (
                    <div className="animate-fade-in w-full">
                        <h2 className="text-2xl font-bold text-center text-white mb-4">როგორ ჩაიარა დღემ?</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           <DailyLog initialData={dailyLogData} />
                           <EnergyLog initialData={energyLogData} />
                        </div>
                    </div>
                );
            case 1:
                return (
                     <div className="animate-fade-in w-full">
                        <h2 className="text-2xl font-bold text-center text-white mb-4">რეფლექსიის დრო</h2>
                        {isLoadingPrompt ? <div className="loader mx-auto"></div> : (
                            <p className="text-center text-lg italic text-brand-color mb-4">"{reflectionPrompt}"</p>
                        )}
                        <textarea
                            value={reflectionAnswer}
                            onChange={(e) => setReflectionAnswer(e.target.value)}
                            className="w-full p-2 bg-black/30 border-white/10 rounded-md h-40"
                            placeholder="თქვენი ფიქრები..."
                        />
                    </div>
                );
            case 2:
                 return (
                     <div className="animate-fade-in w-full">
                        <h2 className="text-2xl font-bold text-center text-white mb-4">გონების გასუფთავება</h2>
                        <p className="text-center text-gray-400 text-sm mb-4">ჩამოწერეთ ყველაფერი, რაც გაწუხებთ ან გახსოვთ — იდეები, საქმეები, ფიქრები.</p>
                        <textarea
                            value={brainDump}
                            onChange={(e) => setBrainDump(e.target.value)}
                            className="w-full p-2 bg-black/30 border-white/10 rounded-md h-40"
                            placeholder="ხვალ გასაკეთებელი საქმეები, ახალი იდეები..."
                        />
                    </div>
                );
            case 3:
                 return (
                    <div className="text-center animate-fade-in">
                        <h2 className="text-3xl font-bold text-white mb-4">დღე დასრულებულია.</h2>
                        <p className="text-lg text-gray-300">დამშვიდდით და კარგად გამოიძინეთ.</p>
                    </div>
                );
            default: return null;
        }
    };

    return (
        <div className="flex flex-col items-center justify-between h-[85vh] w-full">
            <div className="flex-grow flex items-center justify-center w-full">
                {renderStep()}
            </div>
            <div className="flex-shrink-0 mt-6 flex justify-between w-full max-w-md">
                <button onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0} className="px-6 py-2 bg-gray-600 text-white rounded-lg font-semibold disabled:opacity-50">უკან</button>
                {step < 3 ? (
                    <button onClick={() => setStep(s => s + 1)} className="px-6 py-2 bg-accent-color text-white rounded-lg font-semibold">შემდეგი</button>
                ) : (
                    <button onClick={handleSaveAndExit} className="px-6 py-2 bg-green-600 text-white rounded-lg font-semibold">დასრულება და შენახვა</button>
                )}
            </div>
        </div>
    );
};

export default EveningRoutine;
