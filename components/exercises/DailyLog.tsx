
import React, { useState, useEffect, useRef } from 'react';
import dayjs from 'dayjs';
import ExerciseWrapper from './ExerciseWrapper';
import { useAppContext } from '../../context/AppContext';
import { LifeItem } from '../../types';
import { useToast } from '../../context/ToastContext';

// For webkitSpeechRecognition
declare global {
  // Types for the Web Speech API
  interface SpeechRecognitionEvent extends Event {
    readonly resultIndex: number;
    readonly results: SpeechRecognitionResultList;
  }

  interface SpeechRecognitionResultList {
    readonly length: number;
    item(index: number): SpeechRecognitionResult;
    [index: number]: SpeechRecognitionResult;
  }

  interface SpeechRecognitionResult {
    readonly isFinal: boolean;
    readonly length: number;
    item(index: number): SpeechRecognitionAlternative;
    [index: number]: SpeechRecognitionAlternative;
  }

  interface SpeechRecognitionAlternative {
    readonly transcript: string;
  }

  interface SpeechRecognitionErrorEvent extends Event {
    readonly error: string;
  }

  interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    onresult: (event: SpeechRecognitionEvent) => void;
    onerror: (event: SpeechRecognitionErrorEvent) => void;
    onend: () => void;
    start(): void;
    stop(): void;
    abort(): void;
  }
  
  var SpeechRecognition: {
      prototype: SpeechRecognition;
      new(): SpeechRecognition;
  };

  var webkitSpeechRecognition: {
      prototype: SpeechRecognition;
      new(): SpeechRecognition;
  };
  
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof webkitSpeechRecognition;
  }
}


interface DailyLogData {
    rating: number;
    notes: string;
    gratitude: string;
    dateISO: string;
}

const MicIcon = () => <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4z"></path><path fillRule="evenodd" d="M10 18a7 7 0 007-7h-2a5 5 0 01-5 5 5 5 0 01-5-5H3a7 7 0 007 7z" clipRule="evenodd"></path></svg>;

const DailyLog: React.FC<{ initialData: LifeItem | null }> = ({ initialData }) => {
    const { addOrUpdateLifeItem } = useAppContext();
    const { addToast } = useToast();
    const [data, setData] = useState<DailyLogData>({
        rating: 3,
        notes: '',
        gratitude: '',
        dateISO: dayjs().toISOString(),
    });

    const [isRecording, setIsRecording] = useState(false);
    const [targetField, setTargetField] = useState<'notes' | 'gratitude' | null>(null);
    const recognitionRef = useRef<SpeechRecognition | null>(null);
    const committedTranscriptRef = useRef<string>('');

    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            console.log("Speech recognition not supported in this browser.");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'ka-GE';

        recognition.onresult = (event) => {
            let interimTranscript = '';
            let finalTranscriptChunk = '';

            for (let i = event.resultIndex; i < event.results.length; ++i) {
                const transcript = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    finalTranscriptChunk += transcript + ' '; // Add space after each final part
                } else {
                    interimTranscript += transcript;
                }
            }

            if (targetField) {
                if (finalTranscriptChunk) {
                    committedTranscriptRef.current += finalTranscriptChunk;
                }
                setData(prev => ({
                    ...prev,
                    [targetField]: committedTranscriptRef.current + interimTranscript
                }));
            }
        };
        
        recognition.onend = () => {
            if (targetField) {
                 setData(prev => ({ ...prev, [targetField]: committedTranscriptRef.current.trim() }));
            }
            setIsRecording(false);
            setTargetField(null);
        };

        recognition.onerror = (event) => {
            addToast(`ხმის ამოცნობის შეცდომა: ${event.error}`, 'error');
            setIsRecording(false);
            setTargetField(null);
        };

        recognitionRef.current = recognition;
        
        return () => {
            recognitionRef.current?.abort();
        };

    }, [targetField, addToast]);


    useEffect(() => {
        if (initialData?.payload) {
            setData({
                rating: initialData.mood ? (initialData.mood / 2) + 3 : 3,
                notes: String(initialData.payload.notes || ''),
                gratitude: String(initialData.payload.gratitude || ''),
                dateISO: initialData.dateISO || dayjs().toISOString(),
            });
        }
    }, [initialData]);

    const handleToggleRecording = (field: 'notes' | 'gratitude') => {
        if (!recognitionRef.current) {
            addToast('ხმით შეყვანა არ არის მხარდაჭერილი ამ ბრაუზერში.', 'error');
            return;
        }

        if (isRecording) {
            recognitionRef.current.stop();
        } else {
            committedTranscriptRef.current = data[field] ? data[field] + ' ' : '';
            setTargetField(field);
            setIsRecording(true);
            recognitionRef.current.start();
        }
    };

    const handleChange = (field: keyof DailyLogData, value: string | number) => {
        setData(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = async (logData: DailyLogData) => {
        await addOrUpdateLifeItem({
            id: initialData?.id || undefined,
            type: 'event',
            title: `დღიური: ${dayjs(logData.dateISO).format('D MMM')}, შეფასება: ${logData.rating}/5`,
            dateISO: dayjs(logData.dateISO).toISOString(),
            category: 'personal',
            mood: (logData.rating - 3) * 2,
            payload: {
                slug: 'daily-log',
                notes: logData.notes,
                gratitude: logData.gratitude,
            },
        });
    };
    
    const handleReset = () => {
        setData({
            rating: 3, notes: '', gratitude: '', dateISO: dayjs().toISOString()
        });
    };

    const MicButton: React.FC<{ field: 'notes' | 'gratitude' }> = ({ field }) => (
        <button
            type="button"
            onClick={() => handleToggleRecording(field)}
            className={`absolute bottom-2 right-2 p-2 rounded-full transition-colors ${isRecording && targetField === field ? 'bg-accent-color text-white mic-recording' : 'bg-gray-700/50 hover:bg-gray-600/70 text-gray-300'}`}
            aria-label={isRecording && targetField === field ? "Stop recording" : "Start recording"}
        >
            <MicIcon />
        </button>
    );

    return (
        <ExerciseWrapper
            slug="daily-log"
            title="ყოველდღიური ჩანაწერი"
            description="შეაფასე დღე, ჩაიწერე ფიქრები."
            initialData={initialData}
            gatherData={() => data}
            onSave={() => handleSave(data)}
            onReset={handleReset}
        >
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                        დღის შეფასება (1-5): <span className="font-bold brand-text">{data.rating}</span>
                    </label>
                    <input
                        type="range"
                        min="1"
                        max="5"
                        value={data.rating}
                        onChange={e => handleChange('rating', parseInt(e.target.value))}
                        className="w-full accent-brand-color"
                    />
                </div>
                <div className="relative">
                    <label className="block text-sm font-medium text-gray-300 mb-1">შენიშვნები / ფიქრები:</label>
                    <textarea id="daily-log-notes" value={data.notes} onChange={e => handleChange('notes', e.target.value)} className="w-full p-2 bg-black/30 border-white/10 rounded-md h-24"></textarea>
                    <MicButton field="notes" />
                </div>
                <div className="relative">
                    <label className="block text-sm font-medium text-gray-300 mb-1">რისთვის ხარ მადლიერი დღეს?</label>
                    <textarea id="daily-log-gratitude" value={data.gratitude} onChange={e => handleChange('gratitude', e.target.value)} className="w-full p-2 bg-black/30 border-white/10 rounded-md h-16"></textarea>
                    <MicButton field="gratitude" />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">თარიღი:</label>
                    <input type="date" value={dayjs(data.dateISO).format('YYYY-MM-DD')} onChange={e => handleChange('dateISO', e.target.value)} className="p-2 bg-black/30 border-white/10 rounded-md w-full"/>
                </div>
            </div>
        </ExerciseWrapper>
    );
};

export default DailyLog;
