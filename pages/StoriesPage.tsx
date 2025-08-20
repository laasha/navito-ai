
import React from 'react';
import { useAppContext } from '../context/AppContext';
import { Link } from 'react-router-dom';
import dayjs from 'dayjs';

const StoriesPage: React.FC = () => {
    const { lifeItems } = useAppContext();
    const stories = lifeItems
        .filter(item => item.type === 'goal')
        .sort((a,b) => dayjs(b.dateISO).valueOf() - dayjs(a.dateISO).valueOf());

    return (
        <div className="space-y-8">
            <h2 className="text-2xl font-semibold accent-text">ჩემი ისტორიები</h2>
            <p className="text-gray-400">აქ თავმოყრილია თქვენი მიზნები, რომლებიც თქვენი ცხოვრების ისტორიების თავებს წარმოადგენს. გახსენით ნებისმიერი, რომ ნახოთ დაკავშირებული მოვლენების სრული თაიმლაინი.</p>

            {stories.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {stories.map(story => (
                        <Link 
                            key={story.id} 
                            to={`/stories/${story.id}`}
                            className="glass-effect rounded-xl p-6 block hover:border-[var(--brand-color)] transition-all border border-transparent"
                        >
                            <h3 className="text-lg font-semibold brand-text mb-2">{story.title}</h3>
                            <p className="text-sm text-gray-300 line-clamp-2">{story.payload?.details || 'დეტალები არ არის მითითებული.'}</p>
                            <p className="text-xs text-gray-500 mt-4">ვადა: {dayjs(story.dateISO).format('YYYY-MM-DD')}</p>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="text-center py-10 glass-effect rounded-xl">
                    <p className="text-gray-500">თქვენ ჯერ არ გაქვთ დასახული მიზნები, რომლებიც ისტორიის დასაწყისი შეიძლება გახდეს.</p>
                    <Link to="/dashboard" className="mt-4 inline-block p-2 bg-brand-color text-black rounded-lg text-sm font-semibold">
                        დაამატე პირველი მიზანი
                    </Link>
                </div>
            )}
        </div>
    );
};

export default StoriesPage;
