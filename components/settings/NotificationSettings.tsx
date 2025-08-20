
import React from 'react';
import { useAppContext } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';

const NotificationSettings: React.FC = () => {
    const { userSettings, saveUserSettings } = useAppContext();
    const { addToast } = useToast();

    const handleToggle = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const updatedSettings = {
            ...userSettings,
            notifications: {
                ...userSettings.notifications,
                weeklyDigest: e.target.checked,
            },
        };
        await saveUserSettings(updatedSettings);
        addToast('პარამეტრები განახლდა!', 'success');
    };

    return (
        <div className="glass-effect rounded-xl p-6">
            <h3 className="text-xl font-semibold mb-4">შეტყობინებები</h3>
            <p className="text-sm text-gray-400 mb-4">მართეთ, როგორ დაგიკავშირდეთ Navito.</p>
            <div className="flex items-center justify-between bg-black/20 p-4 rounded-lg">
                <div>
                    <h4 className="font-semibold">ყოველკვირეული AI დაიჯესტი</h4>
                    <p className="text-xs text-gray-400">მიიღეთ თქვენი პროგრესის პერსონალური ანალიზი და რჩევები იმეილზე.</p>
                </div>
                <label htmlFor="weekly-digest-toggle" className="relative inline-flex items-center cursor-pointer">
                    <input 
                        type="checkbox" 
                        id="weekly-digest-toggle"
                        className="sr-only peer"
                        checked={userSettings.notifications?.weeklyDigest || false}
                        onChange={handleToggle}
                    />
                    <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-focus:ring-2 peer-focus:ring-brand-color peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-color"></div>
                </label>
            </div>
        </div>
    );
};

export default NotificationSettings;
