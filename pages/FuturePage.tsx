


import React from 'react';
import ValuesClarification from '../components/future/ValuesClarification';
import ScenarioSimulator from '../components/future/ScenarioSimulator';
import ContentSummarizer from '../components/future/ContentSummarizer';
import SmartDecompose from '../components/exercises/SmartDecompose';
import { useAppContext } from '../context/AppContext';

interface FuturePageProps {
    isTabbed?: boolean;
}

const FuturePage: React.FC<FuturePageProps> = ({ isTabbed = false }) => {
    const { findLatestExerciseItem } = useAppContext();
    const smartDecomposeData = findLatestExerciseItem('smart-decompose');

    return (
        <div className="space-y-8">
            {!isTabbed && (
                <>
                    <h1 className="text-3xl font-bold accent-text">მომავლის დაგეგმვა 🚀</h1>
                    <p className="text-gray-400 max-w-3xl">
                        განსაზღვრეთ თქვენი ღირებულებები, გაათამაშეთ მომავლის სცენარები და გადააქციეთ ინფორმაცია ქმედებად. ეს არის თქვენი სტრატეგიული შტაბი.
                    </p>
                </>
            )}

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                <div className="space-y-8">
                    <ValuesClarification />
                    <ScenarioSimulator />
                </div>
                <div className="space-y-8">
                    <SmartDecompose initialData={smartDecomposeData} />
                    <ContentSummarizer />
                </div>
            </div>
        </div>
    );
};

export default FuturePage;