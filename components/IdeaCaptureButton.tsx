
import React from 'react';
import { useModal } from '../context/ModalContext';
import IdeaCaptureModal from './IdeaCaptureModal';

const IdeaCaptureButton: React.FC = () => {
    const { openModal } = useModal();

    const handleOpen = () => {
        openModal(<IdeaCaptureModal />);
    };

    return (
        <button
            onClick={handleOpen}
            className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-accent-color text-white rounded-full flex items-center justify-center shadow-lg hover:bg-fuchsia-500 transition-transform transform hover:scale-110"
            aria-label="იდეის სწრაფი დაფიქსირება"
            title="იდეის სწრაფი დაფიქსირება"
        >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
        </button>
    );
};

export default IdeaCaptureButton;
