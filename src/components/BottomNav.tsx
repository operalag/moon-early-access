'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutGrid, Bot, Newspaper, Settings } from 'lucide-react';
import { motion } from 'framer-motion';

export default function BottomNav() {
  const pathname = usePathname();

  const tabs = [
    { name: 'Markets', href: '/', icon: LayoutGrid },
    { name: 'AI Analyst', href: '/chat', icon: Bot },
    { name: 'News', href: '/news', icon: Newspaper },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <div className="fixed bottom-6 left-6 right-6 z-50">
      <div className="bg-[#121212]/90 backdrop-blur-xl border border-white/10 rounded-[24px] p-2 flex justify-between items-center shadow-2xl shadow-black/50">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href;
          const Icon = tab.icon;

          return (
            <Link 
              key={tab.name} 
              href={tab.href}
              className="flex-1 relative py-3 flex flex-col items-center justify-center gap-1"
            >
              {isActive && (
                <motion.div 
                  layoutId="activeTab"
                  className="absolute inset-0 bg-white/10 rounded-[20px]"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              
              <Icon 
                size={24} 
                className={`relative z-10 transition-colors duration-300 ${
                  isActive ? 'text-yellow-500' : 'text-zinc-500'
                }`} 
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span className={`relative z-10 text-[10px] font-bold uppercase tracking-wide transition-colors duration-300 ${
                 isActive ? 'text-white' : 'text-zinc-500'
              }`}>
                {tab.name}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
