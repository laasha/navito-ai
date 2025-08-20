
import React, { useState, useRef, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { useModal } from '../context/ModalContext';
import { useToast } from '../context/ToastContext';
import { parseNaturalLanguageInput } from '../services/geminiService';
import LifeItemEditModal from './LifeItemEditModal';
import { ParsedNaturalInput } from '../types';

const MicIcon = () => <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4z"></path><path fillRule="evenodd" d="M10 18a7 7 0 007-7h-2a5 5 0 01-5 5 5 5 0 01-5-5H3a7 7 0 007 7z" clipRule="evenodd"></path></svg>;

const NaturalInputModal: React.FC = () => {
    const { openModal, closeModal } = useModal();
    const { addToast } = useToast();
    const [inputText, setInputText] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const recognitionRef = useRef<SpeechRecognition | null>(null);

     useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) return;

        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'ka-GE';

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            setInputText(prev => prev ? `${prev} ${transcript}` : transcript);
            setIsRecording(false);
        };
        
        recognition.onend = () => setIsRecording(false);

        recognition.onerror = (event) => {
            addToast(`ხმის ამოცნობის შეცდომა: ${event.error}`, 'error');
            setIsRecording(false);
        };
        recognitionRef.current = recognition;
    }, [addToast]);
    
    const handleToggleRecording = () => {
        if (!recognitionRef.current) {
            addToast('ხმით შეყვანა არ არის მხარდაჭერილი ამ ბრაუზერში.', 'error');
            return;
        }
        if (isRecording) {
            recognitionRef.current.stop();
        } else {
            setIsRecording(true);
            recognitionRef.current.start();
        }
    };

    const handleAnalyze = async () => {
        if (!inputText.trim()) {
            addToast('გთხოვთ, შეიყვანოთ ტექსტი.', 'error');
            return;
        }
        setIsProcessing(true);
        try {
            const parsedData: ParsedNaturalInput = await parseNaturalLanguageInput(inputText);
            addToast('ტექსტი გაანალიზებულია!', 'success');
            
            // We need to close the current modal before opening the new one
            closeModal(); 
            // A brief timeout allows the first modal to fully close before the second opens
            setTimeout(() => {
                openModal(<LifeItemEditModal initialData={{
                    ...parsedData,
                    payload: { details: parsedData.details }
                }} />);
            }, 100);

        } catch (error: any) {
            addToast(error.message, 'error');
            setIsProcessing(false);
        }
    };

    return (
        <div>
            <h2 className="text-xl font-semibold mb-4 accent-text">სწრაფი დამატება საუბრით</h2>
            <p className="text-sm text-gray-400 mb-4">აღწერეთ მოვლენა ან მიზანი თავისუფლად. AI შეეცდება, გაიგოს და შეავსოს ველები თქვენ მაგივრად.</p>
            <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="w-full p-2 bg-black/30 border-white/10 rounded-md h-32"
                placeholder="მაგ: დავამატო მიზანი: ვისწავლო 50 ახალი სიტყვა ესპანურად ამ თვის ბოლომდე..."
                autoFocus
            />
            <div className="mt-6 flex justify-between items-center">
                 <button
                    type="button"
                    onClick={handleToggleRecording}
                    className={`p-3 rounded-full transition-colors ${isRecording ? 'bg-accent-color text-white mic-recording' : 'bg-gray-700 hover:bg-gray-600 text-gray-300'}`}
                    aria-label={isRecording ? "ჩაწერის შეჩერება" : "ჩაწერის დაწყება"}
                >
                    <MicIcon />
                </button>
                <div className="space-x-3">
                    <button onClick={closeModal} className="p-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg text-sm">გაუქმება</button>
                    <button onClick={handleAnalyze} disabled={isProcessing} className="p-2 bg-green-600 hover:bg-green-500 text-white rounded-lg text-sm flex items-center disabled:opacity-50">
                        {isProcessing && <span className="loader mr-2"></span>}
                        ანალიზი და გაგრძელება
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NaturalInputModal;
