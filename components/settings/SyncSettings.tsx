
import React from 'react';
import dayjs from 'dayjs';
import { useAppContext } from '../../context/AppContext';

const SyncSettings: React.FC = () => {
    const { syncWearableData, biometricData } = useAppContext();
    
    const lastSyncDate = biometricData.length > 0
        ? dayjs(biometricData[biometricData.length - 1].dateISO).format('YYYY-MM-DD')
        : 'არასდროს';

    return (
        <div className="glass-effect rounded-xl p-6">
            <h3 className="text-xl font-semibold mb-4">სინქრონიზაცია</h3>
            <div className="flex justify-between items-center bg-input-bg-color p-4 rounded-lg">
                <div>
                    <h4 className="font-semibold">Wearable მოწყობილობები</h4>
                    <p className="text-xs text-gray-400">ბოლო სინქრონიზაცია: {lastSyncDate}</p>
                </div>
                <button
                    onClick={syncWearableData}
                    className="px-4 py-2 bg-brand-color text-black rounded-lg text-sm font-semibold"
                >
                    სინქრონიზაცია
                </button>
            </div>
        </div>
    );
};

export default SyncSettings;
