'use client';

import { useTelegram } from "@/hooks/useTelegram";
import { Newspaper, ExternalLink, RefreshCw } from "lucide-react";
import InfoTrigger from "@/components/ui/InfoTrigger";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

type NewsItem = {
  id: string;
  text: string;
};

export default function NewsPage() {
  const { webApp } = useTelegram();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNews = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/news');
      const data = await res.json();
      if (data.news) setNews(data.news);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const handleOpenChannel = () => {
    const channelUrl = "https://t.me/cricketandcrypto";
    if (webApp && webApp.openTelegramLink) {
      webApp.openTelegramLink(channelUrl);
    } else {
      window.open(channelUrl, '_blank');
    }
  };

  return (
    <main className="min-h-screen bg-[#050505] p-6 pb-32 text-white relative overflow-hidden">
      
      {/* Background Graphic */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/10 rounded-full blur-[80px] pointer-events-none translate-x-1/2 -translate-y-1/2" />

      {/* Header */}
      <div className="flex items-center justify-between mb-6 relative z-10 pt-4">
        <h1 className="text-3xl font-black uppercase tracking-tighter">
          Intel<span className="text-green-500">.</span>
        </h1>
        <div className="flex items-center gap-3">
          <button 
             onClick={fetchNews} 
             className="p-2 bg-white/5 rounded-full hover:bg-white/10"
             disabled={loading}
          >
            <RefreshCw size={18} className={`text-zinc-400 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <InfoTrigger title="Market Intel" content="Live feed from our official channel. Get the alpha before the market moves." />
        </div>
      </div>

      {/* CTA Card */}
      <div 
        className="bg-gradient-to-br from-green-900/40 to-black border border-white/10 rounded-[32px] p-6 relative overflow-hidden text-center mb-8"
      >
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 mix-blend-overlay" />
          <div className="flex justify-between items-center relative z-10">
            <div className="text-left">
              <h2 className="text-lg font-bold text-white">@cricketandcrypto</h2>
              <p className="text-zinc-400 text-xs">Official Signal Channel</p>
            </div>
            <button 
              onClick={handleOpenChannel}
              className="bg-white text-black font-bold py-2 px-4 rounded-xl flex items-center gap-2 hover:scale-105 transition-transform shadow-lg text-xs"
            >
              <span>OPEN</span>
              <ExternalLink size={14} />
            </button>
          </div>
      </div>

      {/* News Feed */}
      <div className="space-y-4">
        <h3 className="text-white/40 text-xs font-bold uppercase tracking-widest pl-2">Latest Wire</h3>
        
        {loading && news.length === 0 ? (
          <div className="space-y-3">
            {[1,2,3].map(i => (
              <div key={i} className="h-24 bg-white/5 rounded-[24px] animate-pulse" />
            ))}
          </div>
        ) : news.length === 0 ? (
          <p className="text-center text-zinc-500 text-sm py-10">No recent updates found.</p>
        ) : (
          news.map((item, i) => (
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: i * 0.05 }}
              key={i}
              className="bg-white/5 border border-white/10 rounded-[24px] p-5 hover:bg-white/10 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-green-500/20 flex-shrink-0 flex items-center justify-center mt-1">
                  <Newspaper size={14} className="text-green-500" />
                </div>
                <div>
                   <p className="text-sm text-zinc-200 leading-relaxed whitespace-pre-wrap line-clamp-4">
                     {item.text}
                   </p>
                   {item.text.length > 150 && (
                     <button onClick={handleOpenChannel} className="text-green-500 text-xs font-bold mt-2 hover:underline">
                       Read more
                     </button>
                   )}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

    </main>
  );
}