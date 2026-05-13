import React, { useState, useEffect } from 'react';
import { AILocalService } from '../services/aiLocalService';
import { Sparkles, Loader2, AlertCircle } from 'lucide-react';

export const AILoadingIndicator: React.FC = () => {
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');

  useEffect(() => {
    const checkStatus = setInterval(() => {
      setStatus(AILocalService.getStatus());
    }, 500);
    return () => clearInterval(checkStatus);
  }, []);

  if (status === 'ready') {
    return (
      <div className="flex items-center gap-1 text-xs text-green-600 bg-green-50 dark:bg-green-900/30 px-2 py-1 rounded-full">
        <Sparkles size={12} />
        <span>IA Pronta</span>
      </div>
    );
  }

  if (status === 'loading') {
    return (
      <div className="flex items-center gap-1 text-xs text-amber-600 bg-amber-50 dark:bg-amber-900/30 px-2 py-1 rounded-full">
        <Loader2 size={12} className="animate-spin" />
        <span>Baixando IA...</span>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="flex items-center gap-1 text-xs text-red-600 bg-red-50 dark:bg-red-900/30 px-2 py-1 rounded-full">
        <AlertCircle size={12} />
        <span>IA Indisponível</span>
      </div>
    );
  }

  return null;
};