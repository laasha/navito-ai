
import React, { useState } from 'react';
import dayjs from 'dayjs';
import { useAppContext } from '../../context/AppContext';

interface ConnectionManagerProps {
    connections: string[];
    setConnections: React.Dispatch<React.SetStateAction<string[]>>;
    currentItemId?: string;
}

const ConnectionManager: React.FC<ConnectionManagerProps> = ({ connections, setConnections, currentItemId }) => {
    const { lifeItems } = useAppContext();
    const [searchTerm, setSearchTerm] = useState('');

    const handleAddConnection = (itemId: string) => {
        if (!connections.includes(itemId)) {
            setConnections([...connections, itemId]);
        }
        setSearchTerm('');
    };
    
    const handleRemoveConnection = (itemId: string) => {
        setConnections(connections.filter(id => id !== itemId));
    };

    const availableConnections = lifeItems.filter(
        item => item.id !== currentItemId && !connections.includes(item.id) && item.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const connectedItems = lifeItems.filter(item => connections.includes(item.id));

    return (
        <div>
            <label className="block text-sm mt-3">დაკავშირებული ჩანაწერები:</label>
            <div className="flex flex-wrap gap-2 mt-2">
                {connectedItems.map(item => (
                    <div key={item.id} className="flex items-center bg-gray-700 rounded-full px-3 py-1 text-sm">
                        <span>{item.title}</span>
                        <button 
                            onClick={() => handleRemoveConnection(item.id)} 
                            className="ml-2 text-gray-400 hover:text-white"
                            aria-label={`Remove connection to ${item.title}`}
                        >
                            &times;
                        </button>
                    </div>
                ))}
            </div>
            <div className="relative mt-2">
                <input
                    type="text"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full mt-1 p-2 bg-black/30 border-white/10 rounded-md"
                    placeholder="მოძებნე ჩანაწერი დასაკავშირებლად..."
                />
                {searchTerm && availableConnections.length > 0 && (
                    <ul className="absolute z-10 w-full bg-gray-800 border border-gray-700 rounded-md mt-1 max-h-40 overflow-y-auto">
                        {availableConnections.slice(0, 10).map(item => (
                            <li
                                key={item.id}
                                onClick={() => handleAddConnection(item.id)}
                                className="px-3 py-2 hover:bg-gray-700 cursor-pointer text-sm"
                            >
                                {item.title} ({dayjs(item.dateISO).format('YYYY-MM-DD')})
                            </li>
                        ))}
                    </ul>
                )}
                 {searchTerm && availableConnections.length === 0 && (
                     <div className="absolute z-10 w-full bg-gray-800 border border-gray-700 rounded-md mt-1 p-2 text-sm text-gray-400">
                        ჩანაწერი ვერ მოიძებნა.
                    </div>
                )}
            </div>
        </div>
    );
};

export default ConnectionManager;
