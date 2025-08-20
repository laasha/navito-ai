
import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../context/AppContext';
import { getChatResponse } from '../services/geminiService';
import { ChatMessage } from '../types';

const ChatAssistant: React.FC = () => {
    const { chatHistory, addChatMessage, setChatHistory } = useAppContext();
    const [input, setInput] = useState('');
    const [isThinking, setIsThinking] = useState(false);
    const chatDisplayRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (chatDisplayRef.current) {
            chatDisplayRef.current.scrollTop = chatDisplayRef.current.scrollHeight;
        }
    }, [chatHistory, isThinking]);

    const handleSend = async () => {
        if (input.trim() === '' || isThinking) return;

        const userMessage: ChatMessage = { role: 'user', text: input.trim() };
        await addChatMessage(userMessage);
        setInput('');
        setIsThinking(true);
        
        try {
            const responseText = await getChatResponse(userMessage.text);
            const assistantMessage: ChatMessage = { role: 'assistant', text: responseText };
            await addChatMessage(assistantMessage);
        } catch (error) {
            console.error(error);
            const errorMessage: ChatMessage = { role: 'assistant', text: "ბოდიში, შეცდომა მოხდა." };
            await addChatMessage(errorMessage);
        } finally {
            setIsThinking(false);
        }
    };
    
    return (
        <>
            <div className="flex justify-between items-center mb-2">
                <h4 className="text-sm font-semibold whitespace-nowrap">Navito-Guide</h4>
                <div className="w-3 h-3 rounded-full bg-green-500" title="დაკავშირებულია"></div>
            </div>
            <div ref={chatDisplayRef} className="h-32 bg-black/20 rounded-lg p-2 text-xs overflow-y-auto mb-2">
                {chatHistory.length === 0 && !isThinking && <p className="text-gray-400">AI ჩატი...</p>}
                {chatHistory.map((msg, index) => (
                    <p key={index} className={`mb-1.5 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                        <span className={`px-2 py-1 rounded-lg inline-block ${msg.role === 'user' ? 'bg-[var(--accent-color)]/30' : 'bg-[var(--brand-color)]/30'}`}>
                            {msg.text}
                        </span>
                    </p>
                ))}
                {isThinking && (
                    <p className="text-left mb-1.5">
                        <span className="px-2 py-1 rounded-lg inline-block bg-[var(--brand-color)]/30">
                            <span className="loader"></span>
                        </span>
                    </p>
                )}
            </div>
            <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                disabled={isThinking}
                className="w-full p-1.5 text-xs bg-black/30 border border-white/10 rounded-md focus:ring-1 focus:ring-[var(--brand-color)] focus:border-[var(--brand-color)] outline-none"
                placeholder="ჰკითხე Navito-ს..."
            />
        </>
    );
};

export default ChatAssistant;
