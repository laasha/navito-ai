
import React from 'react';
import { useAppContext } from '../../context/AppContext';
import { UserSettings } from '../../types';

const AiSettings: React.FC = () => {
    const { userSettings, saveUserSettings } = useAppContext();

    const handlePersonalityChange = (personality: UserSettings['aiPersonality']) => {
        saveUserSettings({ ...userSettings, aiPersonality: personality });
    };

    const personalities: { id: UserSettings['aiPersonality'], name: string, description: string }[] = [
        { id: 'coach', name: 'ბრძენი მრჩეველი', description: 'ფოკუსირებულია ზრდაზე, მოტივაციაზე და სტრატეგიულ რჩევებზე.' },
        { id: 'analyst', name: 'მონაცემთა ანალიტიკოსი', description: 'ფოკუსირებულია ტრენდებზე, სტატისტიკაზე და ობიექტურ ფაქტებზე.' },
        { id: 'friend', name: 'ემპათიური მეგობარი', description: 'ფოკუსირებულია მხარდაჭერაზე, თანაგრძნობაზე და თბილ კომუნიკაციაზე.' },
    ];

    return (
        <div className="glass-effect rounded-xl p-6">
            <h3 className="text-xl font-semibold mb-4">AI პერსონალიზაცია</h3>
            <p className="text-sm text-gray-400 mb-4">აირჩიეთ, როგორი იყოს თქვენი Navito-ს AI. ეს ცვლის AI-ს კომუნიკაციის სტილს მთელ აპლიკაციაში.</p>
            <div className="space-y-3">
                {personalities.map(p => (
                     <label key={p.id} className="flex items-center p-3 bg-input-bg-color rounded-lg cursor-pointer border-2 border-transparent has-[:checked]:border-brand-color">
                        <input
                            type="radio"
                            name="ai-personality"
                            value={p.id}
                            checked={userSettings.aiPersonality === p.id}
                            onChange={() => handlePersonalityChange(p.id)}
                            className="h-4 w-4 text-brand-color accent-brand-color bg-gray-700 border-gray-600"
                        />
                        <div className="ml-3">
                            <span className="font-semibold">{p.name}</span>
                            <p className="text-xs text-gray-400">{p.description}</p>
                        </div>
                    </label>
                ))}
            </div>
        </div>
    );
};

export default AiSettings;
