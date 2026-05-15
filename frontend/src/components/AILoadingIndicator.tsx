import React from 'react';
import { Brain } from 'lucide-react';

export const AILoadingIndicator: React.FC = () => {
  return (
    <div className="flex items-center gap-1 text-xs text-gray-600 bg-gray-100 dark:bg-gray-800 dark:text-gray-300 px-2.5 py-1 rounded-full border border-gray-200 dark:border-gray-700">
      <Brain size={11} />
      <span className="font-medium">Synapse AI</span>
    </div>
  );
};
