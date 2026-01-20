'use client';

import { useState } from 'react';
import { useTelegram } from '@/hooks/useTelegram';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';

export default function SpinPage() {
  const { user } = useTelegram();
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [prize, setPrize] = useState<string | null>(null);

  const prizes = [
    { label: '50 Pts', value: 50, color: '#ef4444' },
    { label: '100 Pts', value: 100, color: '#f97316' },
    { label: '200 Pts', value: 200, color: '#eab308' },
    { label: '500 Pts', value: 500, color: '#22c55e' },
    { label: 'Try Again', value: 0, color: '#3b82f6' },
    { label: 'JACKPOT', value: 1000, color: '#a855f7' },
  ];

  const handleSpin = async () => {
    if (spinning || !user) return;
    
    setSpinning(true);
    setPrize(null);

    // 1. Determine result (Client side for visual, should be server-side in prod)
    const randomIndex = Math.floor(Math.random() * prizes.length);
    const selectedPrize = prizes[randomIndex];

    // 2. Calculate rotation
    const spinRotations = 5; // Spin 5 times fully
    const segmentAngle = 360 / prizes.length;
    // Offset to center the segment
    const endRotation = (spinRotations * 360) + (randomIndex * segmentAngle); 
    
    setRotation(rotation + endRotation + 1800 + Math.random() * 50); // Add randomness

    // 3. Wait for animation
    setTimeout(async () => {
      setSpinning(false);
      setPrize(selectedPrize.label);

      if (selectedPrize.value > 0) {
        // 4. Update points in DB
        const { data: profile } = await supabase
          .from('profiles')
          .select('total_points')
          .eq('telegram_id', user.id)
          .single();

        if (profile) {
          await supabase
            .from('profiles')
            .update({ total_points: profile.total_points + selectedPrize.value })
            .eq('telegram_id', user.id);
        }
      }

    }, 3000);
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-6 bg-black text-white overflow-hidden">
       <div className="w-full max-w-md flex flex-col items-center">
        
        {/* Header */}
        <div className="flex w-full items-center gap-4 mb-8">
          <Link href="/" className="text-zinc-400 hover:text-white transition-colors">
            ← Back
          </Link>
          <h1 className="text-2xl font-bold uppercase tracking-wider">Market Volatility</h1>
        </div>

        {/* Wheel Container */}
        <div className="relative w-64 h-64 mb-10">
          {/* Pointer */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4 z-20 w-8 h-8 bg-white rotate-45 border-4 border-black"></div>

          <div 
            className="w-full h-full rounded-full border-4 border-zinc-800 relative overflow-hidden transition-transform duration-[3000ms] ease-out"
            style={{ transform: `rotate(-${rotation}deg)` }}
          >
            {prizes.map((p, i) => (
              <div 
                key={i}
                className="absolute w-1/2 h-1/2 top-0 right-0 origin-bottom-left flex items-center justify-center font-bold text-xs text-black border-l border-b border-black/20"
                style={{ 
                  backgroundColor: p.color,
                  transform: `rotate(${i * (360 / prizes.length)}deg) skewY(-30deg)` // Simplified skew for CSS wheel
                }}
              >
               <span style={{ transform: 'skewY(30deg) rotate(15deg) translate(40px, -10px)' }}>{p.label}</span>
              </div>
            ))}
          </div>
        </div>

        <button 
          onClick={handleSpin} 
          disabled={spinning}
          className={`w-full py-4 rounded-2xl font-black text-xl mb-8 transition-all ${
            spinning ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' : 'bg-yellow-500 hover:bg-yellow-400 text-black hover:scale-105'
          }`}
        >
          {spinning ? 'TRADING...' : 'SPIN THE MARKET'}
        </button>

        {prize && (
           <div className="text-center animate-bounce">
             <p className="text-zinc-400 text-sm mb-1">Result:</p>
             <h2 className="text-4xl font-black text-white">{prize}</h2>
             {prize !== 'Try Again' && <p className="text-green-400 font-bold">+ Points added!</p>}
           </div>
        )}

        <div className="bg-zinc-900/50 p-4 rounded-xl text-center text-xs text-zinc-500 mt-auto">
          Daily limit: 1 Spin. Reset at 00:00 UTC.
        </div>

      </div>
    </main>
  );
}
