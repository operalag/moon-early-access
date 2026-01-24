'use client';

import { useState, useEffect } from 'react';
import { useTelegram } from '@/hooks/useTelegram';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';
import { ArrowLeft, Lock } from 'lucide-react';
import InfoTrigger from '@/components/ui/InfoTrigger';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'framer-motion';

// Helper: Get today's date in Mumbai Time (YYYY-MM-DD)
const getMumbaiDate = (date = new Date()) => {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(date);
};

export default function SpinPage() {
  const { user } = useTelegram();
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [prize, setPrize] = useState<string | null>(null);
  const [canSpin, setCanSpin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState<string>('');

  const prizes = [
    { label: '5', value: 5, color: 'from-red-500 to-red-700', weight: 30 },
    { label: '50', value: 50, color: 'from-orange-500 to-orange-700', weight: 25 },
    { label: '100', value: 100, color: 'from-yellow-400 to-yellow-600', weight: 20 },
    { label: '200', value: 200, color: 'from-green-500 to-green-700', weight: 10 },
    { label: '500', value: 500, color: 'from-blue-500 to-blue-700', weight: 5 },
    { label: '1K', value: 1000, color: 'from-purple-500 to-purple-700', weight: 10 },
  ];

  const calculateTimeRemaining = () => {
    // Get next midnight in Mumbai
    const now = new Date();
    const mumbaiTime = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
    
    // Create 'tomorrow midnight' object relative to Mumbai time
    const midnight = new Date(mumbaiTime);
    midnight.setHours(24, 0, 0, 0); // Next midnight
    
    const diff = midnight.getTime() - mumbaiTime.getTime();
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  useEffect(() => {
    async function checkEligibility() {
      if (!user) return;
      
      let lastSpinDateStr: string | null = null;

      // 1. Check DB
      const { data: profile } = await supabase
        .from('profiles')
        .select('last_spin_at')
        .eq('telegram_id', user.id)
        .single();

      if (profile?.last_spin_at) {
        lastSpinDateStr = profile.last_spin_at;
      } else {
        // 2. Check LocalStorage (Fallback)
        const local = localStorage.getItem(`last_spin_${user.id}`);
        if (local) lastSpinDateStr = local;
      }

      if (lastSpinDateStr) {
        const lastSpinDate = getMumbaiDate(new Date(lastSpinDateStr));
        const todayDate = getMumbaiDate(new Date());

        if (lastSpinDate === todayDate) {
          setCanSpin(false);
          setTimeRemaining(calculateTimeRemaining());
        } else {
          setCanSpin(true);
        }
      } else {
        setCanSpin(true);
      }
      setLoading(false);
    }
    checkEligibility();
  }, [user]);

  const getWeightedPrizeIndex = () => {
    const totalWeight = prizes.reduce((acc, p) => acc + p.weight, 0);
    let random = Math.random() * totalWeight;
    for (let i = 0; i < prizes.length; i++) {
      if (random < prizes[i].weight) return i;
      random -= prizes[i].weight;
    }
    return 0;
  };

  const handleSpin = async () => {
    if (spinning || !canSpin || !user) return;
    
    setSpinning(true);
    setPrize(null);

    try {
        // 1. Call Secure API
        const res = await fetch('/api/spin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: user.id })
        });
        
        const data = await res.json();

        if (!res.ok) {
            alert(data.error || "Spin Failed");
            setSpinning(false);
            return;
        }

        const selectedPrize = data.prize;
        
        // Find index for animation
        const selectedIndex = prizes.findIndex(p => p.label === selectedPrize.label);
        
        // 2. Animation Logic
        const segmentAngle = 360 / prizes.length;
        const spinRotations = 8; 
        const targetAngle = (selectedIndex * segmentAngle);
        const newRotation = (spinRotations * 360) + (360 - targetAngle) - 90 - (segmentAngle / 2);

        setRotation(prev => prev + newRotation);

        setTimeout(async () => {
          setSpinning(false);
          setPrize(selectedPrize.label);
          setCanSpin(false);
          
          confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 }, colors: ['#ffd700', '#ffffff'] });

          const now = new Date().toISOString();
          localStorage.setItem(`last_spin_${user.id}`, now);
          
          setTimeRemaining(calculateTimeRemaining());

          // Redirect to Dashboard
          setTimeout(() => {
             window.location.href = '/'; 
          }, 2500);

        }, 3000); 
    } catch (err) {
        console.error("Spin error:", err);
        setSpinning(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#050505] p-6 pb-24 text-white overflow-hidden flex flex-col items-center justify-center relative">
       
       <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-full blur-[120px] pointer-events-none" />

       <div className="w-full max-w-md flex flex-col items-center relative z-10">
        
        {/* Header */}
        <div className="absolute top-0 left-0 w-full flex items-center justify-between mt-4">
          <Link href="/" className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors">
            <ArrowLeft size={20} className="text-zinc-400" />
          </Link>
          <div className="flex items-center">
            <h1 className="text-xs font-bold uppercase tracking-[0.2em] text-white/50">Daily Spin</h1>
            <InfoTrigger title="Daily Limit" content="Spin once per day. Resets at midnight Mumbai Time (IST)." />
          </div>
        </div>

        {/* Wheel Section */}
        <div className="mt-24 relative">
          {/* Pointer */}
          <div className="absolute -top-5 left-1/2 -translate-x-1/2 z-30 drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)]">
            <div className="w-8 h-12 bg-gradient-to-b from-white to-zinc-300 clip-path-polygon-[50%_100%,_0_0,_100%_0] rounded-t-lg shadow-xl" 
                 style={{ clipPath: 'polygon(50% 100%, 0 0, 100% 0)' }}
            />
          </div>

          {/* Outer Ring */}
          <div className="relative w-80 h-80 rounded-full p-1 bg-gradient-to-b from-yellow-500/50 to-purple-600/50 shadow-[0_0_60px_rgba(234,179,8,0.1)]">
            <div className="absolute inset-0 rounded-full border-4 border-white/10 z-20 pointer-events-none" />
            
            {/* The Actual Wheel */}
            <div 
              className="w-full h-full rounded-full relative overflow-hidden shadow-2xl bg-[#121212]"
              style={{ 
                transform: `rotate(${rotation}deg)`,
                transition: 'transform 3s cubic-bezier(0.15, 0, 0.15, 1)', 
              }}
            >
              {prizes.map((p, i) => (
                <div 
                  key={i}
                  className={`absolute w-1/2 h-1/2 top-0 right-0 origin-bottom-left flex items-center justify-center border-l border-white/5 bg-gradient-to-br ${p.color}`}
                  style={{ 
                    transform: `rotate(${i * (360 / prizes.length)}deg) skewY(-30deg)`,
                  }}
                >
                  <span 
                    className="text-white font-black text-2xl tracking-tighter"
                    style={{ 
                      transform: 'skewY(30deg) rotate(30deg) translate(50px, -20px)',
                      textShadow: '0 2px 0 rgba(0,0,0,0.2)'
                    }}
                  >
                    {p.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Center SPIN Button */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-40">
               <button 
                  onClick={handleSpin}
                  disabled={!canSpin || spinning || loading}
                  className={`w-24 h-24 rounded-full flex flex-col items-center justify-center border-[6px] transition-all duration-300 shadow-[0_0_30px_rgba(0,0,0,0.5)] active:scale-95 ${
                    canSpin 
                      ? 'bg-gradient-to-br from-white to-zinc-200 border-[#121212] cursor-pointer hover:scale-105' 
                      : 'bg-[#1a1a1a] border-[#2a2a2a] cursor-not-allowed grayscale opacity-90'
                  }`}
               >
                 {loading ? (
                    <div className="w-6 h-6 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                 ) : !canSpin ? (
                    <>
                      <Lock size={18} className="text-zinc-500 mb-1" />
                      <span className="text-[10px] font-bold text-zinc-500 font-mono">{timeRemaining}</span>
                    </>
                 ) : spinning ? (
                    <span className="text-[10px] font-black tracking-widest text-black/50 animate-pulse">...</span>
                 ) : (
                    <span className="text-lg font-black tracking-tighter text-black italic">SPIN</span>
                 )}
               </button>
            </div>

          </div>
        </div>

        {/* Result Area */}
        <div className="mt-16 h-32 w-full flex items-center justify-center">
          <AnimatePresence mode="wait">
            {prize && !spinning && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.5, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-center"
              >
                <motion.div 
                  initial={{ scale: 1 }}
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="inline-block px-6 py-2 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-full mb-4 shadow-[0_0_20px_rgba(234,179,8,0.4)]"
                >
                  <span className="text-black font-black text-sm uppercase tracking-widest">Winner!</span>
                </motion.div>
                <h2 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-400 drop-shadow-2xl">
                  {prize}
                </h2>
                <p className="text-zinc-500 text-xs font-mono mt-2">Points added to wallet</p>
              </motion.div>
            )}
            {!canSpin && !prize && !loading && (
               <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center text-zinc-500 text-xs font-medium"
               >
                 <p>Cooldown active.</p>
                 <p>Next spin at midnight (IST).</p>
               </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </main>
  );
}