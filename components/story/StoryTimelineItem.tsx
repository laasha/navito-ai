import React from 'react';
import { LifeItem } from '../../types';
import dayjs from 'dayjs';
import { useAppContext } from '../../context/AppContext';
import { useModal } from '../../context/ModalContext';
import LifeItemEditModal from '../LifeItemEditModal';

const ItemIcon: React.FC<{ type: LifeItem['type'] }> = ({ type }) => {
    switch (type) {
        case 'goal': return <span title="Goal">🎯</span>;
        case 'exercise': return <span title="Exercise">🧘</span>;
        case 'event': default: return <span title="Event">📌</span>;
    }
};

const StoryTimelineItem: React.FC<{ item: LifeItem }> = ({ item }) => {
    const { userSettings } = useAppContext();
    const { openModal } = useModal();
    const category = userSettings.categories.find(c => c.id === item.category);

    return (
        <div className="relative">
            {/* Dot on the timeline */}
            <div 
                className="absolute -left-[38px] top-1 h-4 w-4 rounded-full border-4 border-[var(--base-color)]"
                style={{ backgroundColor: category?.color || 'var(--brand-color)' }}
            ></div>

            <div 
                className="glass-effect rounded-xl p-4 cursor-pointer hover:border-[var(--accent-color)] border border-transparent transition-all"
                onClick={() => openModal(<LifeItemEditModal itemToEdit={item} />)}
            >
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-xs text-gray-400">
                            <ItemIcon type={item.type} /> {dayjs(item.dateISO).format('YYYY-MM-DD')}
                        </p>
                        <h4 className="font-semibold">{item.title}</h4>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: `${category?.color}33`, color: category?.color }}>
                        {category?.name || item.category}
                    </span>
                </div>
                {item.payload?.details && (
                    <p className="text-sm text-gray-300 mt-2 prose prose-sm prose-invert" dangerouslySetInnerHTML={{__html: item.payload.details.replace(/\n/g, '<br>')}}></p>
                )}
            </div>
        </div>
    );
};

export default StoryTimelineItem;
