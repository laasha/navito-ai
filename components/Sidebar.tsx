


import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { useModal } from '../context/ModalContext';
import NaturalInputModal from './NaturalInputModal';

const NavItem: React.FC<{ to: string; icon: React.ReactNode; label: string; }> = ({ to, icon, label }) => (
    <NavLink
        to={to}
        end={to === "/"}
        className={({ isActive }) =>
            `flex items-center space-x-3 p-3 rounded-xl w-full overflow-hidden ${isActive ? 'bg-white/10 brand-text' : 'text-gray-300 hover:bg-white/10 hover:brand-text'}`
        }
    >
        {icon}
        <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 delay-100 whitespace-nowrap">{label}</span>
    </NavLink>
);

const DashboardIcon = () => <svg className="w-6 h-6 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path></svg>;
const TimelineIcon = () => <svg className="w-6 h-6 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"></path></svg>;
const CommandIcon = () => <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>;
const SettingsIcon = () => <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>;
const ZenIcon = () => <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v.01M12 20v.01M4 12h.01M20 12h.01M6.31 6.31l.01.01M17.69 17.69l.01.01M6.31 17.69l.01-.01M17.69 6.31l.01.01"></path></svg>;
const LogoutIcon = () => <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>;
const PlusIcon = () => <svg className="w-6 h-6 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>;

export const Sidebar: React.FC = () => {
    const { toggleZenMode, logout } = useAppContext();
    const { openModal } = useModal();

    const handleAddItem = () => {
        openModal(<NaturalInputModal />);
    };
    
    return (
        <nav className="w-20 hover:w-64 fixed left-0 top-0 h-full glass-effect p-4 flex flex-col items-center space-y-2 transition-all duration-300 ease-in-out group z-50">
            <svg className="w-8 h-8 mb-4 brand-text" viewBox="0 0 100 40" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 20 Q 15 5, 25 20 T 45 20 Q 55 35, 65 20 T 85 20 Q 90 10, 95 20" stroke="currentColor" strokeWidth="4" fill="none" strokeLinecap="round" />
            </svg>
            
            <button onClick={handleAddItem} className="flex items-center space-x-3 p-3 rounded-xl w-full overflow-hidden bg-accent-color/80 text-white hover:bg-accent-color" title="სწრაფი დამატება">
                <PlusIcon />
                <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 delay-100 whitespace-nowrap font-semibold">ახალი ჩანაწერი</span>
            </button>

            <div className="w-full space-y-2">
                <NavItem to="/dashboard" icon={<DashboardIcon />} label="მთავარი" />
                <NavItem to="/timeline" icon={<TimelineIcon />} label="ლაიფლაინი" />
                <NavItem to="/command" icon={<CommandIcon />} label="სამოქმედო ცენტრი" />
                <NavItem to="/settings" icon={<SettingsIcon />} label="პარამეტრები" />
            </div>

            <div className="flex-grow"></div>
            
            <div className="w-full space-y-2">
                <button onClick={toggleZenMode} className="flex items-center space-x-3 p-3 rounded-xl w-full overflow-hidden text-gray-300 hover:brand-text" title="Zen რეჟიმი">
                    <ZenIcon />
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 delay-100 whitespace-nowrap">Zen რეჟიმი</span>
                </button>
                
                <button onClick={logout} className="flex items-center space-x-3 p-3 rounded-xl w-full overflow-hidden text-gray-300 hover:brand-text" title="გამოსვლა">
                    <LogoutIcon />
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 delay-100 whitespace-nowrap">გამოსვლა</span>
                </button>
            </div>
        </nav>
    );
};