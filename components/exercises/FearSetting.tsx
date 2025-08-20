
import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import ExerciseWrapper from './ExerciseWrapper';
import { useAppContext } from '../../context/AppContext';
import { LifeItem } from '../../types';

interface FearSettingData {
    goal: string;
    define: string;
    prevent: string;
    repair: string;
}

const FearSetting: React.FC<{ initialData: LifeItem | null }> = ({ initialData }) => {
    const { addOrUpdateLifeItem } = useAppContext();
    const [data, setData] = useState<FearSettingData>({ goal: '', define: '', prevent: '', repair: '' });
    const [currentStep, setCurrentStep] = useState(0); // 0: goal, 1: define, 2: prevent, 3: repair

    useEffect(() => {
        if (initialData?.payload) {
            setData({
                goal: String(initialData.payload.goal || ''),
                define: String(initialData.payload.define || ''),
                prevent: String(initialData.payload.prevent || ''),
                repair: String(initialData.payload.repair || ''),
            });
            // If there's initial data, reveal all fields
            setCurrentStep(3);
        }
    }, [initialData]);

    useEffect(() => {
        // Automatically advance to the next step as user types
        if (data.goal && currentStep < 1) setCurrentStep(1);
        if (data.define && currentStep < 2) setCurrentStep(2);
        if (data.prevent && currentStep < 3) setCurrentStep(3);
    }, [data.goal, data.define, data.prevent, currentStep]);

    const handleChange = (field: keyof FearSettingData, value: string) => {
        setData(prev => ({ ...prev, [field]: value }));
    };
    
    const handleSave = async (fearData: FearSettingData) => {
        await addOrUpdateLifeItem({
            id: initialData?.id || undefined,
            type: 'exercise',
            title: `შიშის განსაზღვრა: ${fearData.goal || 'უსათაურო'}`,
            dateISO: dayjs().toISOString(),
            category: 'personal',
            payload: { 
                slug: 'fear-setting', 
                ...fearData
            },
        });
    };
    
    const handleReset = () => {
        setData({ goal: '', define: '', prevent: '', repair: '' });
        setCurrentStep(0);
    };

    return (
        <ExerciseWrapper
            slug="fear-setting"
            title="შიშის განსაზღვრა (Fear Setting)"
            description="დაამარცხე პროკრასტინაცია შიშების რაციონალური ანალიზით."
            initialData={initialData}
            gatherData={() => data}
            onSave={() => handleSave(data)}
            onReset={handleReset}
        >
            <div className="space-y-4">
                 <div>
                    <label className="block text-sm font-medium mb-1">მიზანი ან ქმედება, რომლისაც გეშინია:</label>
                    <input 
                        type="text" 
                        value={data.goal} 
                        onChange={e => handleChange('goal', e.target.value)} 
                        className="w-full p-2 bg-black/30 border-white/10 rounded-md" 
                        placeholder="მაგ: ახალი პროექტის დაწყება, საუბარი უფროსთან..."
                    />
                </div>
                {currentStep >= 1 && (
                    <div className="animate-fade-in">
                        <label className="block text-sm font-medium text-red-400 mb-1">1. განსაზღვრე (Define): რა არის ყველაზე ცუდი, რაც შეიძლება მოხდეს?</label>
                        <textarea value={data.define} onChange={e => handleChange('define', e.target.value)} className="w-full p-2 bg-black/30 border-white/10 rounded-md h-28" placeholder="ჩამოთვალე ყველა შესაძლო ნეგატიური შედეგი..."></textarea>
                    </div>
                )}
                 {currentStep >= 2 && (
                    <div className="animate-fade-in">
                        <label className="block text-sm font-medium text-green-400 mb-1">2. აიცილე თავიდან (Prevent): როგორ შემიძლია შევამცირო თითოეული ამ შედეგის ალბათობა?</label>
                        <textarea value={data.prevent} onChange={e => handleChange('prevent', e.target.value)} className="w-full p-2 bg-black/30 border-white/10 rounded-md h-28" placeholder="რა პრევენციული ნაბიჯების გადადგმა შემიძლია..."></textarea>
                    </div>
                 )}
                {currentStep >= 3 && (
                    <div className="animate-fade-in">
                        <label className="block text-sm font-medium text-blue-400 mb-1">3. გამოასწორე (Repair): თუ ყველაზე ცუდი მოხდა, როგორ შემიძლია ამის გამოსწორება ან ვის ვთხოვო დახმარება?</label>
                        <textarea value={data.repair} onChange={e => handleChange('repair', e.target.value)} className="w-full p-2 bg-black/30 border-white/10 rounded-md h-28" placeholder="რა ნაბიჯებს გადავდგამ სიტუაციის გამოსასწორებლად..."></textarea>
                    </div>
                )}
            </div>
        </ExerciseWrapper>
    );
};

export default FearSetting;
