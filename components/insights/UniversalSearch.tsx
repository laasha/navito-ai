import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { useModal } from '../../context/ModalContext';
import { performUniversalSearch } from '../../services/geminiService';
import { UniversalSearchResponse } from '../../types';
import LifeItemEditModal from '../LifeItemEditModal';
import dayjs from 'dayjs';

const SearchIcon = () => <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" /></svg>;

const UniversalSearch: React.FC = () => {
    const { lifeItems, habits, biometricData, legacyEntries, userSettings } = useAppContext();
    const { addToast } = useToast();
    const { openModal } = useModal();
    const [query, setQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<UniversalSearchResponse | null>(null);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) {
            addToast('გთხოვთ, შეიყვანოთ საძიებო სიტყვა.', 'info');
            return;
        }
        setIsLoading(true);
        setResult(null);
        try {
            const dataContext = JSON.stringify({ lifeItems, habits, biometricData, legacyEntries, userSettings });
            const response = await performUniversalSearch(query, dataContext);
            setResult(response);
            if (!response.summary && response.sourceItems.length === 0) {
                addToast('ამ მოთხოვნით შედეგები ვერ მოიძებნა.', 'info');
            }
        } catch (error: any) {
            addToast(error.message, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSourceItemClick = (itemId: string) => {
        const item = lifeItems.find(i => i.id === itemId);
        if (item) {
            openModal(<LifeItemEditModal itemToEdit={item} />);
        }
    };

    return (
        <div className="glass-effect rounded-xl p-6 mb-8">
            <h2 className="text-2xl font-bold mb-2">უნივერსალური ძიება და სინთეზი</h2>
            <p className="text-sm text-gray-400 mb-4">დაუსვით შეკითხვა თქვენს ცხოვრებისეულ მონაცემებს და მიიღეთ AI-ს მიერ გენერირებული პასუხი.</p>
            <form onSubmit={handleSearch} className="flex gap-2">
                <input
                    type="text"
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    className="w-full p-3 bg-black/30 border-2 border-white/20 rounded-lg focus:outline-none focus:border-brand-color transition-colors"
                    placeholder="მაგ: შეაჯამე ჩემი პროგრესი ესპანურის სწავლაში გასულ თვეს..."
                    disabled={isLoading}
                />
                <button
                    type="submit"
                    className="p-3 bg-brand-color text-black rounded-lg font-semibold flex items-center justify-center disabled:opacity-50"
                    disabled={isLoading}
                >
                    {isLoading ? <span className="loader"></span> : <SearchIcon />}
                </button>
            </form>

            {result && (
                <div className="mt-6 animate-fade-in space-y-6">
                    {result.summary && (
                         <div className="prose prose-invert">
                            <h3 className="text-accent-color">AI შეჯამება</h3>
                            <div dangerouslySetInnerHTML={{ __html: result.summary.replace(/\n/g, '<br />').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                        </div>
                    )}
                   
                    {result.sourceItems.length > 0 && (
                        <div>
                            <h4 className="font-semibold text-gray-300">გამოყენებული წყაროები:</h4>
                            <div className="space-y-3 mt-2">
                                {result.sourceItems.map(item => (
                                    <div 
                                        key={item.id} 
                                        className="bg-black/20 p-3 rounded-lg cursor-pointer hover:bg-black/40"
                                        onClick={() => handleSourceItemClick(item.id)}
                                    >
                                        <div className="flex justify-between items-start">
                                            <p className="font-semibold">{item.title}</p>
                                            <p className="text-xs text-gray-400">{dayjs(item.dateISO).format('DD MMM, YYYY')}</p>
                                        </div>
                                        <p className="text-xs text-gray-400 italic mt-1">"{item.snippet}"</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default UniversalSearch;
