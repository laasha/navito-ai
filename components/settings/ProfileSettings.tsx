
import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';

const ProfileSettings: React.FC = () => {
    const { userSettings, saveUserSettings } = useAppContext();
    const { addToast } = useToast();
    
    const [name, setName] = useState('');
    const [quote, setQuote] = useState('');

    useEffect(() => {
        setName(userSettings.userName);
        setQuote(userSettings.userQuote);
    }, [userSettings]);
    
    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        await saveUserSettings({ ...userSettings, userName: name, userQuote: quote });
        addToast('პროფილი განახლდა!', 'success');
    };

    return (
        <form onSubmit={handleSave} className="glass-effect rounded-xl p-6">
            <h3 className="text-xl font-semibold mb-4">პერსონალური პროფილი</h3>
            <div className="space-y-4">
                <div>
                    <label htmlFor="userName" className="block text-sm font-medium text-gray-300">თქვენი სახელი</label>
                    <input
                        type="text"
                        id="userName"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="mt-1 w-full p-2 bg-input-bg-color border border-surface-border-color rounded-md"
                        placeholder="როგორ მოგმართოთ?"
                    />
                </div>
                 <div>
                    <label htmlFor="userQuote" className="block text-sm font-medium text-gray-300">თქვენი ციტატა ან დევიზი</label>
                    <input
                        type="text"
                        id="userQuote"
                        value={quote}
                        onChange={(e) => setQuote(e.target.value)}
                        className="mt-1 w-full p-2 bg-input-bg-color border border-surface-border-color rounded-md"
                        placeholder="თქვენი პირადი მანტრა"
                    />
                </div>
            </div>
            <button type="submit" className="mt-6 px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg text-sm font-semibold">შენახვა</button>
        </form>
    );
};

export default ProfileSettings;
