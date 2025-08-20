
import React from 'react';
import { useAppContext } from '../../context/AppContext';

interface ValueSelectorProps {
    selectedValues: string[];
    onChange: (selectedIds: string[]) => void;
}

const ValueSelector: React.FC<ValueSelectorProps> = ({ selectedValues, onChange }) => {
    const { userSettings } = useAppContext();
    const { values } = userSettings;

    if (!values || values.length === 0) {
        return null;
    }

    const handleToggle = (valueId: string) => {
        const newSelected = selectedValues.includes(valueId)
            ? selectedValues.filter(id => id !== valueId)
            : [...selectedValues, valueId];
        onChange(newSelected);
    };

    return (
        <div>
            <label className="block text-sm">ღირებულებებთან დაკავშირება:</label>
            <div className="flex flex-wrap gap-2 mt-2">
                {values.map(value => (
                    <button
                        key={value.id}
                        type="button"
                        onClick={() => handleToggle(value.id)}
                        className={`px-3 py-1 text-xs rounded-full transition-colors ${selectedValues.includes(value.id) ? 'bg-accent-color text-white' : 'bg-gray-700 hover:bg-gray-600'}`}
                    >
                        {value.value}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default ValueSelector;
