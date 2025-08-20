
import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { Category } from '../../types';

const CategorySettings: React.FC = () => {
    const { userSettings, saveUserSettings } = useAppContext();
    const { addToast } = useToast();
    const [categories, setCategories] = useState<Category[]>([]);

    useEffect(() => {
        setCategories(userSettings.categories);
    }, [userSettings]);
    
    const handleCategoryChange = (index: number, field: 'name' | 'color', value: string) => {
        const newCategories = [...categories];
        newCategories[index] = { ...newCategories[index], [field]: value };
        setCategories(newCategories);
    };

    const handleSave = async () => {
        await saveUserSettings({ ...userSettings, categories });
        addToast('კატეგორიები შენახულია!', 'success');
    };

    return (
        <div className="glass-effect rounded-xl p-6">
            <h3 className="text-xl font-semibold mb-4">კატეგორიების პერსონალიზაცია</h3>
            <p className="text-sm text-gray-400 mb-4">შეცვალეთ კატეგორიების სახელები და ფერები თქვენი გემოვნებით.</p>
            <div className="space-y-3">
                {categories.map((cat, index) => (
                    <div key={cat.id} className="flex items-center space-x-3">
                        <input
                            type="color"
                            value={cat.color}
                            onChange={(e) => handleCategoryChange(index, 'color', e.target.value)}
                            className="p-1 h-10 w-10 block bg-gray-700 border-gray-600 cursor-pointer rounded-lg"
                        />
                        <input
                            type="text"
                            value={cat.name}
                            onChange={(e) => handleCategoryChange(index, 'name', e.target.value)}
                            className="p-2 bg-black/30 border-white/10 rounded-md w-full"
                        />
                    </div>
                ))}
            </div>
            <button onClick={handleSave} className="mt-4 p-2 bg-green-600 hover:bg-green-500 text-white rounded-lg text-sm font-semibold">ცვლილებების შენახვა</button>
        </div>
    );
};

export default CategorySettings;
