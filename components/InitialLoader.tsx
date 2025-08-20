
import React from 'react';

const InitialLoader: React.FC = () => {
    return (
        <div className="h-full w-full flex flex-col items-center justify-center bg-base-color">
            <div className="relative flex items-center justify-center w-24 h-24">
                 <svg className="w-16 h-16 initial-loader-wave" viewBox="0 0 100 40" xmlns="http://www.w.org/2000/svg">
                    <path 
                        d="M5 20 Q 15 5, 25 20 T 45 20 Q 55 35, 65 20 T 85 20 Q 90 10, 95 20" 
                        stroke="var(--brand-color)" 
                        strokeWidth="5" 
                        fill="none" 
                        strokeLinecap="round" 
                    />
                </svg>
            </div>
            <p className="mt-4 text-gray-400 text-lg animate-pulse">Navito იტვირთება...</p>
        </div>
    );
};

export default InitialLoader;
