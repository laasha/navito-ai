

import React, { useState, useEffect } from 'react';

const OneBreathPause: React.FC = () => {
    const [phase, setPhase] = useState<'idle' | 'in' | 'hold' | 'out'>('idle');
    const [text, setText] = useState('ერთი ამოსუნთქვა');

    const DURATION = { in: 4000, hold: 4000, out: 6000 };

    useEffect(() => {
        if (phase === 'idle') return;

        let timer: ReturnType<typeof setTimeout>;
        if (phase === 'in') {
            setText('ჩაისუნთქე...');
            timer = setTimeout(() => setPhase('hold'), DURATION.in);
        } else if (phase === 'hold') {
            setText('დაიჭირე...');
            timer = setTimeout(() => setPhase('out'), DURATION.hold);
        } else if (phase === 'out') {
            setText('ამოისუნთქე...');
            timer = setTimeout(() => setPhase('idle'), DURATION.out);
        }

        return () => clearTimeout(timer);
    }, [phase]);

    useEffect(() => {
        if (phase === 'idle') {
            setText('ერთი ამოსუნთქვა');
        }
    }, [phase]);

    const startAnimation = () => {
        if (phase === 'idle') {
            setPhase('in');
        }
    };

    const getAnimationClass = () => {
        switch (phase) {
            case 'in': return 'animate-breath-in';
            case 'hold': return 'animate-breath-hold';
            case 'out': return 'animate-breath-out';
            default: return '';
        }
    };

    return (
        <div className="glass-effect rounded-xl p-6 shadow-md flex flex-col items-center justify-center h-64 text-center">
            <h3 className="text-xl font-semibold brand-text mb-4">ერთი ამოსუნთქვა</h3>
            <p className="text-sm text-gray-400 mb-6">სწრაფი პაუზა სიმშვიდისთვის.</p>
            <div 
                onClick={startAnimation} 
                className="w-32 h-32 rounded-full bg-brand-color/20 flex items-center justify-center cursor-pointer relative"
            >
                <div className={`absolute w-full h-full rounded-full bg-brand-color ${getAnimationClass()}`}
                     style={{ transform: phase === 'idle' ? 'scale(0.3)' : '', opacity: phase === 'idle' ? 0.5 : '' }}
                ></div>
                <span className="z-10 text-white font-semibold transition-opacity duration-500">{text}</span>
            </div>
        </div>
    );
};

export default OneBreathPause;
