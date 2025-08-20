import React from 'react';
import { useAppContext } from '../../context/AppContext';
import { useModal } from '../../context/ModalContext';
import { LifeItem } from '../../types';
import LifeItemEditModal from '../LifeItemEditModal';
import dayjs from 'dayjs';

const ConnectedEventsWidget: React.FC<{ goal: LifeItem }> = ({ goal }) => {
    const { lifeItems } = useAppContext();
    const { openModal } = useModal();

    const connectedItems = lifeItems
        .filter(item => item.connections?.includes(goal.id) || goal.connections?.includes(item.id))
        .filter(item => item.id !== goal.id) // Exclude the goal itself
        .sort((a, b) => dayjs(a.dateISO).valueOf() - dayjs(b.dateISO).valueOf());
        
    if (connectedItems.length === 0) {
        return null;
    }

    return (
        <div className="glass-effect rounded-xl p-6">
            <h3 className="text-lg font-semibold brand-text mb-4">დაკავშირებული მოვლენები ⛓️</h3>
            <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                {connectedItems.map(item => (
                    <div 
                        key={item.id} 
                        className="bg-black/20 p-3 rounded-lg cursor-pointer hover:bg-black/40"
                        onClick={() => openModal(<LifeItemEditModal itemToEdit={item} />)}
                    >
                        <p className="font-semibold">{item.title}</p>
                        <p className="text-xs text-gray-400">{dayjs(item.dateISO).format('DD MMMM, YYYY')}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ConnectedEventsWidget;