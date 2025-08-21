import React, { useState } from 'react';
import { useToast } from '../../context/ToastContext';
import { generateTextSafe } from '../../services/geminiService';
import { LifeItem } from '../../types';

interface ExerciseWrapperProps {
  slug: string;
  title: string;
  description: string;
  children: React.ReactNode;
  initialData: LifeItem | null;
  gatherData: () => any;
  onSave: (data: any) => Promise<void>;
  onReset: () => void;
}

const ExerciseWrapper: React.FC<ExerciseWrapperProps> = ({
  slug,
  title,
  description,
  children,
  gatherData,
  onSave,
  onReset,
}) => {
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<string | null>(null);
  const { addToast } = useToast();

  const handleSave = async () => {
    try {
      const data = gatherData();
      await onSave(data);
      addToast(`${title}: ცვლილება შენახულია!`, 'success');
    } catch (error) {
      addToast(`შენახვის შეცდომა მოხდა`, 'error');
      console.error(error);
    }
  };

  const handleReset = () => {
    onReset();
    setAiResult(null);
    addToast(`${title}: ფორმა გაწმენდილია`, 'info');
  };

  const handleAIHint = async () => {
    setIsAiLoading(true);
    setAiResult(null);
    try {
      const currentData = gatherData();
      const res = await generateTextSafe(
        `გთხოვ, დამეხმარე სავარჯიშოზე "${slug}". აი მონაცემები: ${JSON.stringify(currentData)}`
      );

      if (res.error) {
        addToast(res.error, 'error');
      } else {
        setAiResult(res.text || '');
      }
    } catch (error: any) {
      addToast(error.message, 'error');
      setAiResult(`<p class="text-red-400">${error.message}</p>`);
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="glass-effect rounded-xl p-6 shadow-md">
      <div className="mb-4">
        <h3 className="text-xl font-semibold brand-text">{title}</h3>
        <p className="text-sm text-gray-400 mt-1">{description}</p>
      </div>

      <div className="exercise-ui-container mb-4 min-h-[100px]">
        {children}
      </div>

      {(isAiLoading || aiResult) && (
        <div className="result-pane bg-black/20 p-3 rounded-lg min-h-[50px] max-h-48 overflow-y-auto mt-3">
          {isAiLoading && (
            <p className="text-xs text-yellow-400 animate-pulse">AI მუშაობს...</p>
          )}
          {aiResult && (
            <div>
              <p className="text-sm font-semibold mb-1">AI პასუხი:</p>
              <div
                className="text-xs prose prose-sm prose-invert"
                dangerouslySetInnerHTML={{ __html: aiResult }}
              />
            </div>
          )}
        </div>
      )}

      <div className="flex flex-wrap gap-3 mt-4">
        <button
          onClick={handleSave}
          className="flex-1 p-2 bg-green-600 hover:bg-green-500 text-white rounded-lg text-sm"
        >
          შენახვა
        </button>
        <button
          onClick={handleAIHint}
          disabled={isAiLoading}
          className="flex-1 p-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-sm"
        >
          AI დახმარება
        </button>
        <button
          onClick={handleReset}
          className="flex-1 p-2 bg-red-700 hover:bg-red-600 text-white rounded-lg text-sm"
        >
          გასუფთავება
        </button>
      </div>
    </div>
  );
};

export default ExerciseWrapper;
