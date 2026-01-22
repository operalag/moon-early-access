'use client';

import { Info } from 'lucide-react';
import { useInfo } from '@/context/InfoContext';

interface InfoTriggerProps {
  title: string;
  content: string;
  className?: string;
}

export default function InfoTrigger({ title, content, className = '' }: InfoTriggerProps) {
  const { openInfo } = useInfo();

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        openInfo(title, content);
      }}
      className={`ml-2 p-1 text-white/30 hover:text-yellow-500 transition-colors ${className}`}
    >
      <Info size={16} />
    </button>
  );
}
