

import React, { useState } from 'react';
import PastPage from './PastPage';
import FuturePage from './FuturePage';
import ProgramsPage from './ProgramsPage';
import CollapsibleSection from '../components/CollapsibleSection';

// Planning Instruments
import SystemDesigner from '../components/planning_tools/SystemDesigner';
import GoalLaddering from '../components/planning_tools/GoalLaddering';
import IdealWeekPlanner from '../components/planning_tools/IdealWeekPlanner';
import SkillAcquisitionPlanner from '../components/planning_tools/SkillAcquisitionPlanner';
import ProjectKickstart from '../components/planning_tools/ProjectKickstart';
import HabitStackingPlanner from '../components/planning_tools/HabitStackingPlanner';
import PersonalOKRs from '../components/planning_tools/PersonalOKRs';
import ResourceCurator from '../components/planning_tools/ResourceCurator';
import AntiGoalSetting from '../components/planning_tools/AntiGoalSetting';
import DecisionModel101010 from '../components/planning_tools/DecisionModel101010';
import RetrospectivePlanner from '../components/planning_tools/RetrospectivePlanner';

// Micro-tools
import OneBreathPause from '../components/tools/OneBreathPause';
import EpochGoalSetter from '../components/tools/EpochGoalSetter';
import ValueDrivenPrompt from '../components/tools/ValueDrivenPrompt';
import DecisionJournal from '../components/tools/DecisionJournal';
import CognitiveReframer from '../components/tools/CognitiveReframer';
import StoicReflection from '../components/tools/StoicReflection';
import FutureSelfLetter from '../components/tools/FutureSelfLetter';
import ProjectPremortem from '../components/tools/ProjectPremortem';
import HighlightReel from '../components/tools/HighlightReel';
import DailyWins from '../components/tools/DailyWins';
import IdeaCatalyst from '../components/tools/IdeaCatalyst';
import BrainDump from '../components/tools/BrainDump';
import AiToolAdvisor from '../components/AiToolAdvisor';
import IntensityLog from '../components/exercises/IntensityLog';


type Tab = 'analytics' | 'planning' | 'tools';

const CommandPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<Tab>('planning');

    const TabButton: React.FC<{ tabName: Tab; label: string; }> = ({ tabName, label }) => (
        <button
            onClick={() => setActiveTab(tabName)}
            className={`px-6 py-3 text-lg font-semibold rounded-t-lg transition-colors ${activeTab === tabName ? 'bg-white/5 brand-text border-b-2 border-brand-color' : 'text-gray-400 hover:text-white'}`}
        >
            {label}
        </button>
    );

    return (
        <div className="space-y-6">
            <div className="text-center">
                <h1 className="text-4xl font-bold accent-text">სამოქმედო ცენტრი</h1>
                <p className="text-gray-400 max-w-2xl mx-auto mt-2">
                    გააანალიზეთ წარსული, დაგეგმეთ მომავალი და გამოიყენეთ მძლავრი ხელსაწყოები თქვენი აზროვნების გასაუმჯობესებლად.
                </p>
            </div>

            <div className="border-b border-white/10 flex justify-center">
                <TabButton tabName="analytics" label="📊 ანალიტიკა" />
                <TabButton tabName="planning" label="🚀 დაგეგმვა" />
                <TabButton tabName="tools" label="🛠️ ხელსაწყოები" />
            </div>

            <div className="mt-6 animate-fade-in">
                {activeTab === 'analytics' && <PastPage isTabbed />}
                {activeTab === 'planning' && (
                    <div className="space-y-8">
                        <CollapsibleSection title="AI დამგეგმავები">
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                <SystemDesigner />
                                <GoalLaddering />
                                <IdealWeekPlanner />
                                <SkillAcquisitionPlanner />
                                <ProjectKickstart />
                                <HabitStackingPlanner />
                                <ResourceCurator />
                                <AntiGoalSetting />
                            </div>
                        </CollapsibleSection>
                        
                        <CollapsibleSection title="სტრუქტურული მოდელები">
                             <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                <PersonalOKRs />
                                <DecisionModel101010 />
                                <RetrospectivePlanner />
                            </div>
                        </CollapsibleSection>

                        <CollapsibleSection title="სტრატეგიული დაგეგმვა">
                            <FuturePage isTabbed />
                        </CollapsibleSection>
                        
                        <CollapsibleSection title="მართვადი პროგრამები">
                             <ProgramsPage isTabbed />
                        </CollapsibleSection>
                    </div>
                )}
                {activeTab === 'tools' && (
                     <div className="space-y-8">
                        <AiToolAdvisor />
                        <CollapsibleSection title="ფოკუსი და ცნობიერება">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <div id="tool-one-breath-pause"><OneBreathPause /></div>
                                <div id="tool-daily-wins"><DailyWins /></div>
                                <div id="tool-brain-dump"><BrainDump /></div>
                                <div id="tool-intensity-log"><IntensityLog /></div>
                            </div>
                        </CollapsibleSection>
                        <CollapsibleSection title="რეფლექსია და თვითშემეცნება">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <div id="tool-value-driven-prompt"><ValueDrivenPrompt /></div>
                                <div id="tool-stoic-reflection"><StoicReflection /></div>
                                <div id="tool-future-self-letter"><FutureSelfLetter /></div>
                                <div id="tool-highlight-reel"><HighlightReel /></div>
                            </div>
                        </CollapsibleSection>
                        <CollapsibleSection title="პრობლემის გადაჭრა და კრეატიულობა">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <div id="tool-cognitive-reframer"><CognitiveReframer /></div>
                                <div id="tool-project-premortem"><ProjectPremortem /></div>
                                <div id="tool-idea-catalyst"><IdeaCatalyst /></div>
                                <div id="tool-decision-journal"><DecisionJournal /></div>
                            </div>
                        </CollapsibleSection>
                        <CollapsibleSection title="მიზნების დასახვა">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <div id="tool-epoch-goal-setter"><EpochGoalSetter /></div>
                            </div>
                        </CollapsibleSection>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CommandPage;