import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import { getConversationalResponse } from '../services/geminiService';
import { ChatMessage } from '../types';

const CoPilot: React.FC = () => {
    const { lifeItems, habits, biometricData } = useAppContext();
    const { addToast } = useToast();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const chatDisplayRef = useRef<HTMLDivElement>(null);

    const suggestionPrompts = [
        "შეაჯამე გასული კვირა",
        "რა არის ჩემი პრიორიტეტები?",
        "მომიძებნე ჩანაწერები 'სწავლა'-ს შესახებ",
    ];

    const scrollToBottom = () => {
        if (chatDisplayRef.current) {
            chatDisplayRef.current.scrollTop = chatDisplayRef.current.scrollHeight;
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isProcessing]);
    
    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
           if (event.key === 'Escape') {
            setIsOpen(false);
           }
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, []);

    const handleSend = async () => {
        if (!input.trim() || isProcessing) return;

        const userMessage: ChatMessage = { role: 'user', text: input };
        const newMessages = [...messages, userMessage];
        setMessages(newMessages);
        setInput('');
        setIsProcessing(true);

        try {
            const dataContext = `
                Life Items (last 20): ${JSON.stringify(lifeItems.slice(-20).map(i => ({ title: i.title, type: i.type, date: i.dateISO, category: i.category })))}
                Habits: ${JSON.stringify(habits.map(h => ({ name: h.name, logCount: h.log.length })))}
                Biometric Data (last 7 days): ${JSON.stringify(biometricData.slice(-7))}
            `;

            const responseText = await getConversationalResponse(newMessages, dataContext);
            const assistantMessage: ChatMessage = { role: 'assistant', text: responseText };
            setMessages(prev => [...prev, assistantMessage]);
        } catch (error: any) {
            addToast(error.message, 'error');
            const errorMessage: ChatMessage = { role: 'assistant', text: "ბოდიში, პასუხის მიღებისას შეცდომა მოხდა." };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsProcessing(false);
        }
    };
    
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleOpen = () => {
        setIsOpen(true);
        if (messages.length === 0) {
            setMessages([{ role: 'assistant', text: "მოგესალმებით! რით შემიძლია დაგეხმაროთ? შეგიძლიათ მკითხოთ თქვენი მონაცემების შესახებ." }]);
        }
    };

    const handleSuggestionClick = (prompt: string) => {
        setInput(prompt);
    };

    return (
        <>
            <button
                onClick={handleOpen}
                className="w-14 h-14 bg-accent-color/80 border-2 border-accent-color rounded-full flex items-center justify-center shadow-lg hover:bg-accent-color transition-transform transform hover:scale-110 animate-pulse"
                aria-label="Navito Co-Pilot-ის გააქტიურება"
                title="Co-Pilot-ის გააქტიურება"
            >
                 <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"/>
                </svg>
            </button>

            {isOpen && (
                <div 
                    className="fixed inset-0 bg-black/80 backdrop-blur-md z-[1000] flex flex-col items-center justify-center p-4 animate-fade-in"
                    onClick={() => setIsOpen(false)}
                >
                    <div className="w-full max-w-2xl h-[80vh] flex flex-col glass-effect rounded-2xl" onClick={e => e.stopPropagation()}>
                        <div className="flex-shrink-0 p-4 border-b border-white/10 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-white">Navito Co-Pilot</h2>
                             <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white text-2xl leading-none">&times;</button>
                        </div>

                        <div ref={chatDisplayRef} className="flex-grow p-4 overflow-y-auto space-y-4">
                             {messages.map((msg, index) => (
                                <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-md px-4 py-2 rounded-2xl prose prose-invert prose-sm ${msg.role === 'user' ? 'bg-accent-color text-white' : 'bg-gray-700 text-white'}`}>
                                        <div dangerouslySetInnerHTML={{ __html: msg.text.replace(/\n/g, '<br />') }}></div>
                                    </div>
                                </div>
                            ))}
                            {isProcessing && (
                                <div className="flex justify-start">
                                    <div className="max-w-md px-4 py-2 rounded-2xl bg-gray-700 text-white">
                                        <div className="loader w-4 h-4 border-2"></div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex-shrink-0 p-4 border-t border-white/10">
                             <div className="flex flex-wrap gap-2 mb-3">
                                {suggestionPrompts.map((prompt, i) => (
                                    <button
                                        key={i}
                                        onClick={() => handleSuggestionClick(prompt)}
                                        className="px-3 py-1 bg-gray-600/50 text-gray-300 text-xs rounded-full hover:bg-gray-500/70"
                                    >
                                        {prompt}
                                    </button>
                                ))}
                            </div>
                            <div className="relative">
                                <input 
                                    type="text"
                                    value={input}
                                    onChange={e => setInput(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="ჰკითხეთ Navito-ს თქვენი მონაცემების შესახებ..."
                                    className="w-full bg-black/30 border-2 border-white/20 rounded-lg py-3 pl-4 pr-12 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-accent-color"
                                    disabled={isProcessing}
                                    autoFocus
                                />
                                <button
                                    onClick={handleSend}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-md bg-brand-color text-black disabled:opacity-50"
                                    disabled={isProcessing || !input.trim()}
                                >
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"></path></svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default CoPilot;