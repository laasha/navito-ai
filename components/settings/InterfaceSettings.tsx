
import React from 'react';
import { useAppContext } from '../../context/AppContext';

const InterfaceSettings: React.FC = () => {
    const { userSettings, saveUserSettings } = useAppContext();

    const handleThemeChange = (theme: 'dark' | 'light') => {
        saveUserSettings({ ...userSettings, theme });
    };

    const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        saveUserSettings({ ...userSettings, timelineColor: e.target.value });
    };

    return (
        <div className="glass-effect rounded-xl p-6">
            <h3 className="text-xl font-semibold mb-4">ინტერფეისის მართვა</h3>
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-300">აპლიკაციის თემა</label>
                    <div className="mt-2 flex gap-2">
                        <button onClick={() => handleThemeChange('dark')} className={`px-4 py-2 rounded-md text-sm ${userSettings.theme === 'dark' ? 'bg-brand-color text-black' : 'bg-input-bg-color'}`}>
                            🌙 მუქი
                        </button>
                        <button onClick={() => handleThemeChange('light')} className={`px-4 py-2 rounded-md text-sm ${userSettings.theme === 'light' ? 'bg-brand-color text-black' : 'bg-input-bg-color'}`}>
                            ☀️ ღია
                        </button>
                    </div>
                </div>
                 <div>
                    <label htmlFor="timelineColor" className="block text-sm font-medium text-gray-300">"Life-Line"-ის საბაზისო ფერი</label>
                    <div className="mt-2 flex items-center gap-3">
                        <input
                            type="color"
                            id="timelineColor"
                            value={userSettings.timelineColor}
                            onChange={handleColorChange}
                            className="p-1 h-10 w-10 block bg-input-bg-color border-surface-border-color cursor-pointer rounded-lg"
                        />
                        <span className="text-sm font-mono p-2 bg-input-bg-color rounded">{userSettings.timelineColor}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InterfaceSettings;
