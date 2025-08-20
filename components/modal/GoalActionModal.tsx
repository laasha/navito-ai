
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LifeItem } from '../../types';
import { useModal } from '../../context/ModalContext';
import { useAppContext } from '../../context/AppContext';
import LifeItemEditModal from '../LifeItemEditModal';

interface GoalActionModalProps {
    item: LifeItem;
}

const GoalActionModal: React.FC<GoalActionModalProps> = ({ item }) => {
    const { closeModal, openModal } = useModal();
    const { setStoryFocusId } = useAppContext();
    const navigate = useNavigate();

    const handleEdit = () => {
        closeModal();
        // A brief timeout allows the first modal to fully close before the second opens
        setTimeout(() => {
            openModal(<LifeItemEditModal itemToEdit={item} />);
        }, 100);
    };

    const handleFocusStory = () => {
        setStoryFocusId(item.id);
        closeModal();
        navigate('/timeline');
    };

    return (
        <div>
            <h2 className="text-xl font-semibold mb-4 brand-text">{item.title}</h2>
            <p className="text-sm text-gray-400 mb-6">აირჩიეთ სასურველი მოქმედება ამ მიზნისთვის.</p>
            <div className="flex flex-col space-y-3">
                <button
                    onClick={handleEdit}
                    className="w-full p-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold"
                >
                    რედაქტირება ✏️
                </button>
                <button
                    onClick={handleFocusStory}
                    className="w-full p-3 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-semibold"
                >
                    ისტორიაზე ფოკუსირება 📖
                </button>
            </div>
             <div className="mt-6 text-center">
                <button onClick={closeModal} className="text-sm text-gray-400 hover:text-white">
                    დახურვა
                </button>
            </div>
        </div>
    );
};

export default GoalActionModal;
