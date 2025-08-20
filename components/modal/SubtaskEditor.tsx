
import React, { useState } from 'react';
import { Subtask } from '../../types';

interface SubtaskEditorProps {
    subtasks: Subtask[];
    setSubtasks: React.Dispatch<React.SetStateAction<Subtask[]>>;
}

const SubtaskEditor: React.FC<SubtaskEditorProps> = ({ subtasks, setSubtasks }) => {
    const [newSubtaskText, setNewSubtaskText] = useState('');

    const handleAddSubtask = () => {
        if (newSubtaskText.trim()) {
            setSubtasks([...subtasks, { text: newSubtaskText.trim(), completed: false }]);
            setNewSubtaskText('');
        }
    };

    const handleToggleSubtask = (index: number) => {
        const newSubtasks = [...subtasks];
        newSubtasks[index].completed = !newSubtasks[index].completed;
        setSubtasks(newSubtasks);
    };
    
    const handleRemoveSubtask = (index: number) => {
        setSubtasks(subtasks.filter((_, i) => i !== index));
    };

    return (
        <div className="mt-4">
            <label className="block text-sm">ქვე-დავალებები:</label>
            <div className="space-y-2 mt-2">
                {subtasks.map((task, index) => (
                    <div key={index} className="flex items-center group bg-black/20 p-2 rounded-md">
                        <input 
                            type="checkbox" 
                            checked={task.completed} 
                            onChange={() => handleToggleSubtask(index)} 
                            className="h-4 w-4 rounded bg-gray-700 border-gray-600 text-brand-color focus:ring-brand-color flex-shrink-0" 
                        />
                        <span className={`ml-3 flex-grow ${task.completed ? 'line-through text-gray-500' : ''}`}>{task.text}</span>
                        <button 
                            onClick={() => handleRemoveSubtask(index)} 
                            className="ml-2 text-gray-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                            aria-label="Remove subtask"
                        >
                            &times;
                        </button>
                    </div>
                ))}
            </div>
            <div className="flex mt-2">
                <input 
                    type="text" 
                    value={newSubtaskText} 
                    onChange={(e) => setNewSubtaskText(e.target.value)} 
                    onKeyPress={(e) => e.key === 'Enter' && handleAddSubtask()} 
                    className="p-1 bg-black/30 border-white/10 rounded-l-md w-full text-sm" 
                    placeholder="ახალი ქვე-დავალება..." 
                />
                <button 
                    onClick={handleAddSubtask} 
                    className="p-2 bg-brand-color text-black rounded-r-md text-sm font-semibold"
                    aria-label="Add subtask"
                >
                    +
                </button>
            </div>
        </div>
    );
};

export default SubtaskEditor;
