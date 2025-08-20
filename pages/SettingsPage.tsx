

import React, { useState } from 'react';
import CategorySettings from '../components/settings/CategorySettings';
import DataManagement from '../components/settings/DataManagement';
import NotificationSettings from '../components/settings/NotificationSettings';
import ProfileSettings from '../components/settings/ProfileSettings';
import AiSettings from '../components/settings/AiSettings';
import InterfaceSettings from '../components/settings/InterfaceSettings';
import SyncSettings from '../components/settings/SyncSettings';

type Tab = 'profile' | 'ai' | 'interface' | 'data';

const SettingsPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<Tab>('profile');

    const TabButton: React.FC<{ tabName: Tab; label: string; }> = ({ tabName, label }) => (
        <button
            onClick={() => setActiveTab(tabName)}
            className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${activeTab === tabName ? 'bg-brand-color text-black' : 'text-gray-300 hover:bg-white/10'}`}
        >
            {label}
        </button>
    );

    return (
        <div className="space-y-8">
            <h2 className="text-3xl font-bold accent-text">პერსონალიზაციის ჰაბი</h2>
            
            <div className="flex flex-wrap gap-2 p-1 glass-effect rounded-lg">
                <TabButton tabName="profile" label="👤 პროფილი" />
                <TabButton tabName="ai" label="✨ AI" />
                <TabButton tabName="interface" label="🎨 ინტერფეისი" />
                <TabButton tabName="data" label="💾 მონაცემები" />
            </div>

            <div className="animate-fade-in">
                {activeTab === 'profile' && (
                    <div className="space-y-6">
                        <ProfileSettings />
                        <NotificationSettings />
                    </div>
                )}
                {activeTab === 'ai' && (
                    <div className="space-y-6">
                        <AiSettings />
                    </div>
                )}
                {activeTab === 'interface' && (
                    <div className="space-y-6">
                        <InterfaceSettings />
                        <CategorySettings />
                    </div>
                )}
                {activeTab === 'data' && (
                     <div className="space-y-6">
                        <SyncSettings />
                        <DataManagement />
                    </div>
                )}
            </div>
        </div>
    );
};

export default SettingsPage;
