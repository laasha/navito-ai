
import React, { useRef, useEffect } from 'react';
import { useModal } from '../context/ModalContext';

const Modal: React.FC = () => {
  const { isOpen, modalContent, closeModal } = useModal();
  const modalContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeModal();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, closeModal]);

  const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (modalContainerRef.current === event.target) {
      closeModal();
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div
      ref={modalContainerRef}
      onClick={handleBackdropClick}
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100] p-4"
    >
      <div className="glass-effect p-6 rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {modalContent}
      </div>
    </div>
  );
};

export default Modal;
