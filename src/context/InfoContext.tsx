'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';

type InfoContextType = {
  openInfo: (title: string, content: string) => void;
  closeInfo: () => void;
};

const InfoContext = createContext<InfoContextType | undefined>(undefined);

export function InfoProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState({ title: '', content: '' });

  const openInfo = (title: string, content: string) => {
    setData({ title, content });
    setIsOpen(true);
  };

  const closeInfo = () => setIsOpen(false);

  return (
    <InfoContext.Provider value={{ openInfo, closeInfo }}>
      {children}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeInfo}
              className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
            />
            {/* Drawer */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-[70] bg-[#121212] border-t border-white/10 p-6 rounded-t-3xl shadow-2xl"
            >
              <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-6" />
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-yellow-500">{data.title}</h3>
                <button onClick={closeInfo} className="p-1 bg-white/5 rounded-full hover:bg-white/10">
                  <X size={20} className="text-zinc-400" />
                </button>
              </div>
              <p className="text-zinc-300 leading-relaxed text-sm">
                {data.content}
              </p>
              <button 
                onClick={closeInfo}
                className="w-full mt-8 bg-white/5 border border-white/10 text-white font-medium py-3 rounded-xl hover:bg-white/10 transition-colors"
              >
                Got it
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </InfoContext.Provider>
  );
}

export const useInfo = () => {
  const context = useContext(InfoContext);
  if (!context) throw new Error('useInfo must be used within an InfoProvider');
  return context;
};
