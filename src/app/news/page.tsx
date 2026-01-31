'use client';

import { useTelegram } from "@/hooks/useTelegram";
import { ExternalLink, Users, Volume2 } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

type NewsItem = {
  id: string;
  text: string;
  date: string;
};

function formatTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
}

function formatMessageText(text: string): React.ReactNode {
  // Convert markdown-style bold **text** to actual bold
  // and handle links
  const parts = text.split(/(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\)|https?:\/\/[^\s]+)/g);

  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-semibold">{part.slice(2, -2)}</strong>;
    }
    if (part.match(/^\[[^\]]+\]\([^)]+\)$/)) {
      const match = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (match) {
        return (
          <a key={i} href={match[2]} target="_blank" rel="noopener noreferrer"
             className="text-[#3390ec] hover:underline">
            {match[1]}
          </a>
        );
      }
    }
    if (part.match(/^https?:\/\/[^\s]+$/)) {
      return (
        <a key={i} href={part} target="_blank" rel="noopener noreferrer"
           className="text-[#3390ec] hover:underline break-all">
          {part}
        </a>
      );
    }
    return part;
  });
}

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
    <main className="min-h-screen bg-[#0e1621] pb-28">

      {/* Channel Header - Telegram Style */}
      <div className="sticky top-0 z-20 bg-[#17212b] border-b border-white/5">
        <div className="flex items-center gap-3 p-3">
          {/* Channel Avatar */}
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-500 to-orange-600 flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-lg">🏏</span>
          </div>

          {/* Channel Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <h1 className="text-white font-semibold text-[15px] truncate">Cricket & Crypto</h1>
              <Volume2 size={14} className="text-[#3390ec] flex-shrink-0" />
            </div>
            <p className="text-[#6c7883] text-[13px] flex items-center gap-1">
              <Users size={12} />
              <span>channel</span>
            </p>
          </div>

          {/* Open in Telegram Button */}
          <button
            onClick={handleOpenChannel}
            className="bg-[#3390ec] hover:bg-[#2b7fd4] text-white font-medium text-sm py-1.5 px-3 rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <span>Open</span>
            <ExternalLink size={14} />
          </button>
        </div>
      </div>

      {/* Messages Area - Telegram Style Chat */}
      <div className="p-3 space-y-2">

        {loading && news.length === 0 ? (
          <div className="space-y-2">
            {[1,2,3,4].map(i => (
              <div key={i} className="bg-[#182533] rounded-xl p-4 animate-pulse">
                <div className="h-4 bg-white/10 rounded w-3/4 mb-2" />
                <div className="h-4 bg-white/10 rounded w-1/2 mb-2" />
                <div className="h-4 bg-white/10 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : news.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-[#6c7883] text-sm">No messages yet</p>
          </div>
        ) : (
          news.map((item, i) => (
            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: i * 0.05 }}
              key={item.id}
              className="bg-[#182533] rounded-xl px-3 py-2 max-w-[95%]"
            >
              {/* Message Content */}
              <p className="text-[#f5f5f5] text-[14px] leading-[1.5] whitespace-pre-wrap break-words">
                {formatMessageText(item.text)}
              </p>

              {/* Timestamp */}
              <div className="flex justify-end mt-1">
                <span className="text-[#6c7883] text-[11px]">
                  {formatTime(item.date)}
                </span>
              </div>
            </motion.div>
          ))
        )}

        {/* Channel CTA at bottom */}
        {!loading && news.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center py-4"
          >
            <button
              onClick={handleOpenChannel}
              className="text-[#3390ec] text-sm font-medium hover:underline"
            >
              View full channel in Telegram →
            </button>
          </motion.div>
        )}
      </div>

    </main>
  );
}
