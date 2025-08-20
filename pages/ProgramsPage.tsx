


import React from 'react';
import ProgramDesigner from '../components/programs/ProgramDesigner';

interface ProgramsPageProps {
    isTabbed?: boolean;
}

const ProgramsPage: React.FC<ProgramsPageProps> = ({ isTabbed = false }) => {
    return (
        <div className="space-y-8">
            {!isTabbed && (
                <>
                    <h1 className="text-3xl font-bold accent-text">მართვადი პროგრამები</h1>
                    <p className="text-gray-400 max-w-3xl">
                        აქციეთ თქვენი ამბიციური მიზნები სტრუქტურირებულ, მრავალკვირიან სამოქმედო გეგმებად. აღწერეთ თქვენი მიზანი და მიეცით საშუალება Navito-ს AI-ს, შეგიქმნათ პერსონალური პროგრამა, რომელიც მოიცავს ჩვევებს, ყოველკვირეულ ამოცანებს და სტრატეგიულ სავარჯიშოებს.
                    </p>
                </>
            )}
            <ProgramDesigner />
        </div>
    );
};

export default ProgramsPage;