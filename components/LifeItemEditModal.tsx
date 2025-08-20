

import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import { LifeItem, Subtask, LifeItemEditModalProps, LifeItemType } from '../types';
import { useAppContext } from '../context/AppContext';
import { useModal } from '../context/ModalContext';
import { useToast } from '../context/ToastContext';
import SubtaskEditor from './modal/SubtaskEditor';
import ConnectionManager from './modal/ConnectionManager';
import { generateGoalResources } from '../services/geminiService';
import ValueSelector from './modal/ValueSelector';

const LifeItemEditModal: React.FC<LifeItemEditModalProps> = ({ itemToEdit, initialData }) => {
    const { userSettings, addOrUpdateLifeItem, removeLifeItem } = useAppContext();
    const { closeModal } = useModal();
    const { addToast } = useToast();

    const [title, setTitle] = useState('');
    const [dateISO, setDateISO] = useState(dayjs().format('YYYY-MM-DD'));
    const [type, setType] = useState<LifeItemType>('event');
    const [category, setCategory] = useState('personal');
    const [mood, setMood] = useState(0);
    const [details, setDetails] = useState('');
    const [subtasks, setSubtasks] = useState<Subtask[]>([]);
    const [connections, setConnections] = useState<string[]>([]);
    const [alignedValues, setAlignedValues] = useState<string[]>([]);
    const [anticipation, setAnticipation] = useState(0);
    const [people, setPeople] = useState<string[]>([]);
    const [amount, setAmount] = useState<number | undefined>(undefined);
    const [transactionType, setTransactionType] = useState<'income' | 'expense'>('expense');
    const [isFetchingResources, setIsFetchingResources] = useState(false);

    const isNew = !itemToEdit;
    const itemPayload = itemToEdit?.payload || {};
    const isFutureItem = dayjs(dateISO).isAfter(dayjs(), 'day');

    useEffect(() => {
        const item = itemToEdit || initialData || {};
        setTitle(item.title || '');
        setDateISO(dayjs(item.dateISO || new Date()).format('YYYY-MM-DD'));
        setType(item.type || 'event');
        setCategory(item.category || 'personal');
        setMood(item.mood || 0);
        setDetails(item.payload?.details || '');
        setSubtasks(item.subtasks || []);
        setConnections(item.connections || []);
        setAlignedValues(item.payload?.alignedValues || []);
        setAnticipation(item.payload?.anticipation || 0);
        setPeople(item.payload?.people || []);
        setAmount(item.payload?.amount);
        setTransactionType(item.payload?.transactionType || 'expense');
    }, [itemToEdit, initialData]);

    const handleSave = async () => {
        if (!title.trim()) {
            addToast('სათაური აუცილებელია', 'error');
            return;
        }

        const updatedItemData: Partial<LifeItem> = {
            id: isNew ? undefined : itemToEdit?.id,
            title,
            dateISO: dayjs(dateISO).toISOString(),
            type,
            category,
            mood,
            payload: { 
                ...itemPayload, 
                details, 
                people,
                alignedValues: type === 'goal' ? alignedValues : undefined,
                anticipation: isFutureItem ? anticipation : undefined,
                amount: type === 'financial' ? amount : undefined,
                transactionType: type === 'financial' ? transactionType : undefined,
            },
            subtasks: type === 'goal' ? subtasks : [],
            connections,
        };

        await addOrUpdateLifeItem(updatedItemData);
        addToast(`ჩანაწერი ${isNew ? 'დაემატა' : 'განახლდა'}!`, 'success');
        closeModal();
    };

    const handleDelete = async () => {
        if (itemToEdit && window.confirm(`დარწმუნებული ხართ, რომ გსურთ წაშალოთ: "${itemToEdit.title}"?`)) {
            await removeLifeItem(itemToEdit.id);
            addToast('ჩანაწერი წაიშალა!', 'success');
            closeModal();
        }
    };
    
    const handleFetchResources = async () => {
        if (!title.trim()) {
            addToast('გთხოვთ, ჯერ მიზნის სათაური შეიყვანოთ.', 'info');
            return;
        }
        setIsFetchingResources(true);
        try {
            const resources = await generateGoalResources(title);
            const resourceText = `\n\n---\n**შემოთავაზებული რესურსები:**\n${resources}`;
            setDetails(prev => prev.trim() + resourceText);
            addToast('რესურსები დაემატა დეტალებში!', 'success');
        } catch (error: any) {
            addToast(error.message, 'error');
        } finally {
            setIsFetchingResources(false);
        }
    };
    
    const anticipationLabels: { [key: number]: string } = {
        '-5': 'ძლიერი შფოთვა', '-3': 'ნერვიულობა', '0': 'ნეიტრალური', '3': 'მოლოდინი', '5': 'აღფრთოვანება'
    };
    const getAnticipationLabel = (value: number) => {
        return anticipationLabels[value] || 'საშუალო';
    }


    return (
        <div>
            <h2 className="text-xl font-semibold mb-4 brand-text">{isNew ? 'ახალი ჩანაწერი' : 'ჩანაწერის რედაქტირება'}</h2>
            <div className="space-y-3 max-h-[65vh] overflow-y-auto pr-2">
                <div>
                    <label className="block text-sm">სათაური:</label>
                    <div className="flex items-center gap-2 mt-1">
                         <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full p-2 bg-black/30 border-white/10 rounded-md" />
                         {type === 'goal' && (
                             <button onClick={handleFetchResources} disabled={isFetchingResources} title="AI-ს მიერ რესურსების მოძიება" className="p-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg disabled:opacity-50 flex-shrink-0">
                                {isFetchingResources ? <span className="loader !w-4 !h-4"></span> : '✨'}
                             </button>
                         )}
                    </div>
                </div>
                <div><label className="block text-sm">თარიღი/ვადა:</label><input type="date" value={dateISO} onChange={(e) => setDateISO(e.target.value)} className="w-full mt-1 p-2 bg-black/30 border-white/10 rounded-md" /></div>
                <div><label className="block text-sm">ტიპი:</label><select value={type} onChange={(e) => setType(e.target.value as LifeItemType)} className="w-full mt-1 p-2 bg-black/30 border-white/10 rounded-md" disabled={!!itemPayload?.slug}>
                    <option value="event">მოვლენა</option>
                    <option value="goal">მიზანი</option>
                    <option value="exercise">სავარჯიშო</option>
                    <option value="financial">ფინანსური</option>
                </select></div>
                {type === 'financial' && (
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm">თანხა:</label>
                            <input type="number" value={amount || ''} onChange={(e) => setAmount(Number(e.target.value))} className="w-full mt-1 p-2 bg-black/30 border-white/10 rounded-md" />
                        </div>
                        <div>
                            <label className="block text-sm">ტრანზაქციის ტიპი:</label>
                            <select value={transactionType} onChange={(e) => setTransactionType(e.target.value as 'income' | 'expense')} className="w-full mt-1 p-2 bg-black/30 border-white/10 rounded-md">
                                <option value="expense">ხარჯი</option>
                                <option value="income">შემოსავალი</option>
                            </select>
                        </div>
                    </div>
                )}
                <div><label className="block text-sm">კატეგორია:</label><select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full mt-1 p-2 bg-black/30 border-white/10 rounded-md">
                    {userSettings.categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                </select></div>
                <div><label className="block text-sm">განწყობა (-5 to +5):</label><input type="number" value={mood} onChange={(e) => setMood(parseInt(e.target.value))} min="-5" max="5" className="w-full mt-1 p-2 bg-black/30 border-white/10 rounded-md" /></div>
                
                {isFutureItem && (
                     <div>
                        <label className="block text-sm">მოლოდინის დონე: <span className="font-semibold brand-text">{getAnticipationLabel(anticipation)}</span></label>
                        <input type="range" value={anticipation} onChange={(e) => setAnticipation(parseInt(e.target.value))} min="-5" max="5" step="1" className="w-full mt-1 accent-accent-color" />
                    </div>
                )}

                <div><label className="block text-sm">დეტალები:</label><textarea value={details} onChange={(e) => setDetails(e.target.value)} className="w-full mt-1 p-2 bg-black/30 border-white/10 rounded-md h-24"></textarea></div>
                
                <div>
                    <label className="block text-sm">დაკავშირებული პირები (მძიმით გამოყავით):</label>
                    <input type="text" value={people.join(', ')} onChange={(e) => setPeople(e.target.value.split(',').map(p => p.trim()).filter(Boolean))} className="w-full mt-1 p-2 bg-black/30 border-white/10 rounded-md" />
                </div>

                {type === 'goal' && (
                    <>
                        <SubtaskEditor subtasks={subtasks} setSubtasks={setSubtasks} />
                        <ValueSelector 
                            selectedValues={alignedValues} 
                            onChange={setAlignedValues} 
                        />
                    </>
                )}
                
                <ConnectionManager
                    connections={connections}
                    setConnections={setConnections}
                    currentItemId={itemToEdit?.id}
                />
            </div>
            <div className="mt-6 flex justify-between items-center">
                <div>{!isNew && <button onClick={handleDelete} className="p-2 bg-red-700 hover:bg-red-600 text-white rounded-lg text-sm">წაშლა</button>}</div>
                <div className="space-x-3">
                    <button onClick={closeModal} className="p-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg text-sm">გაუქმება</button>
                    <button onClick={handleSave} className="p-2 bg-green-600 hover:bg-green-500 text-white rounded-lg text-sm">შენახვა</button>
                </div>
            </div>
        </div>
    );
};

export default LifeItemEditModal;