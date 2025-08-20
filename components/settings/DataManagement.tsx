

import React from 'react';
import dayjs from 'dayjs';
import { useAppContext } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { useModal } from '../../context/ModalContext';
import { LifeItem, Habit, UserSettings, LegacyEntry } from '../../types';
import { DEFAULT_USER_SETTINGS } from '../../constants';

const DataManagement: React.FC = () => {
    const { lifeItems, habits, userSettings, legacyEntries, handleImportData, removeAllUserData, saveUserSettings } = useAppContext();
    const { addToast } = useToast();
    const { openModal, closeModal } = useModal();

    const handleExport = () => {
        const dataToExport = {
            version: '3.1.react',
            exportedAt: dayjs().toISOString(),
            data: { lifeItems, habits, userSettings, legacyEntries }
        };
        const dataStr = JSON.stringify(dataToExport, null, 2);
        const blob = new Blob([dataStr], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `navito_backup_${dayjs().format('YYYY-MM-DD')}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        addToast('მონაცემები წარმატებით გადმოიწერა!', 'success');
    };

    const handleImportFile = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedData = JSON.parse(e.target?.result as string);
                if (importedData.data && Array.isArray(importedData.data.lifeItems)) {
                    openModal(
                        <ConfirmationModal
                            title="იმპორტის დადასტურება"
                            message="დარწმუნებული ხართ, რომ გსურთ მონაცემების იმპორტი? ეს ქმედება სრულად ჩაანაცვლებს თქვენს ამჟამინდელ მონაცემებს."
                            onConfirm={() => confirmImport(importedData.data)}
                            onCancel={closeModal}
                        />
                    );
                } else {
                    addToast('არასწორი ფაილის ფორმატი.', 'error');
                }
            } catch (err) {
                addToast('ფაილის წაკითხვის შეცდომა.', 'error');
            }
        };
        reader.readAsText(file);
        event.target.value = '';
    };

    const confirmImport = async (data: { lifeItems: LifeItem[], habits: Habit[], userSettings: UserSettings, legacyEntries?: LegacyEntry[] }) => {
        await handleImportData(data);
        addToast('მონაცემები წარმატებით იმპორტირდა!', 'success');
        closeModal();
    };

    const handleClearAllData = () => {
        openModal(
            <ConfirmationModal
                title="ყველა მონაცემის წაშლა"
                message="დარწმუნებული ხართ? ეს ქმედება წაშლის ყველა თქვენს ჩანაწერს, ჩვევას და პარამეტრს. ამის დაბრუნება შეუძლებელი იქნება."
                onConfirm={confirmClearAllData}
                onCancel={closeModal}
            />
        );
    };
    
    const confirmClearAllData = async () => {
        await removeAllUserData();
        addToast('ყველა მონაცემი წაშლილია.', 'success');
        closeModal();
    };

    const handleResetSettings = () => {
        openModal(
             <ConfirmationModal
                title="პარამეტრების განულება"
                message="დარწმუნებული ხართ, რომ გსურთ ყველა პარამეტრის საწყის მდგომარეობაში დაბრუნება?"
                onConfirm={confirmResetSettings}
                onCancel={closeModal}
            />
        )
    };
    
    const confirmResetSettings = async () => {
        await saveUserSettings(DEFAULT_USER_SETTINGS);
        addToast('პარამეტრები განულდა.', 'success');
        closeModal();
    };

    return (
        <>
            <div className="glass-effect rounded-xl p-6">
                <h3 className="text-xl font-semibold mb-4">მონაცემების მართვა</h3>
                <div className="space-y-4">
                    <div>
                        <h4 className="font-semibold">მონაცემების ექსპორტი</h4>
                        <p className="text-sm text-gray-400 mb-2">შეინახეთ თქვენი ყველა მონაცემი ერთ JSON ფაილში.</p>
                        <button onClick={handleExport} className="p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm">ექსპორტი</button>
                    </div>
                    <div>
                        <h4 className="font-semibold">მონაცემების იმპორტი</h4>
                        <p className="text-sm text-gray-400 mb-2">ჩაანაცვლეთ ყველა მონაცემი JSON ფაილიდან.</p>
                        <input type="file" id="import-data-input" accept=".json" onChange={handleImportFile} className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-accent-color file:text-black hover:file:bg-[var(--accent-color)]/80" />
                    </div>
                </div>
            </div>

            <div className="glass-effect rounded-xl p-6 border-2 border-red-500/50">
                <h3 className="text-xl font-semibold mb-4 text-red-400">საშიში ზონა</h3>
                 <div className="space-y-4">
                     <div className="flex justify-between items-center">
                        <div>
                           <h4 className="font-semibold">პარამეტრების განულება</h4>
                           <p className="text-sm text-gray-400">ყველა პარამეტრის საწყის მდგომარეობაში დაბრუნება.</p>
                        </div>
                        <button onClick={handleResetSettings} className="p-2 bg-yellow-600 hover:bg-yellow-500 text-black rounded-lg text-sm font-semibold">განულება</button>
                    </div>
                    <div className="flex justify-between items-center">
                        <div>
                           <h4 className="font-semibold">ყველა მონაცემის წაშლა</h4>
                           <p className="text-sm text-gray-400">მთლიანი ბაზის გასუფთავება.</p>
                        </div>
                        <button onClick={handleClearAllData} className="p-2 bg-red-700 hover:bg-red-600 text-white rounded-lg text-sm font-semibold">წაშლა</button>
                    </div>
                </div>
            </div>
        </>
    );
};

const ConfirmationModal: React.FC<{title: string, message: string, onConfirm: () => void, onCancel: () => void}> = ({ title, message, onConfirm, onCancel }) => (
    <div>
        <h3 className="text-xl font-semibold text-red-400 mb-4">{title}</h3>
        <p>{message}</p>
        <div className="mt-6 flex justify-end space-x-3">
            <button onClick={onCancel} className="p-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg text-sm">გაუქმება</button>
            <button onClick={onConfirm} className="p-2 bg-red-700 hover:bg-red-600 text-white rounded-lg text-sm">დიახ, დადასტურება</button>
        </div>
    </div>
);


export default DataManagement;
