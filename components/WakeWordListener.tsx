
import React from 'react';
import { useModal } from '../context/ModalContext';
import NaturalInputModal from './NaturalInputModal';

const WakeWordListener: React.FC = () => {
    const { openModal } = useModal();
    
    const handleActivate = () => {
        openModal(<NaturalInputModal />);
    };

    return (
        <button
            onClick={handleActivate}
            className="fixed bottom-6 left-6 z-40 w-14 h-14 bg-accent-color/50 border-2 border-accent-color rounded-full flex items-center justify-center shadow-lg hover:bg-fuchsia-500 transition-transform transform hover:scale-110 animate-orb-pulse"
            aria-label="Navito-ს გააქტიურება"
            title="Navito-ს გააქტიურება (Hey, Navito)"
        >
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
        </button>
    );
};

export default WakeWordListener;
