'use client';

import { useState } from 'react';

export default function PointsDebugPage() {
  const [userId, setUserId] = useState('');
  const [amount, setAmount] = useState('100');
  const [log, setLog] = useState<any[]>([]);

  const addLog = (msg: string, data?: any) => {
    setLog(prev => [{ time: new Date().toLocaleTimeString(), msg, data }, ...prev]);
  };

  const handleAward = async () => {
    addLog(`Awarding ${amount} pts to ${userId}...`);
    try {
      const res = await fetch('/api/debug/points', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, amount: Number(amount) })
      });
      const data = await res.json();
      if (res.ok) {
        addLog('✅ Success! New Total: ' + data.newTotal);
        addLog('Transaction Details:', data.details);
      } else {
        addLog('❌ Error: ' + data.error);
      }
    } catch (e: any) {
      addLog('❌ Network Error: ' + e.message);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-8 font-mono">
      <h1 className="text-2xl font-bold mb-8 text-yellow-500">POINTS ENGINE TEST</h1>
      
      <div className="flex gap-4 mb-4">
        <input 
          type="text" 
          value={userId}
          onChange={e => setUserId(e.target.value)}
          placeholder="User ID (e.g. 458184707)"
          className="bg-zinc-900 border border-zinc-800 p-2 rounded"
        />
        <input 
          type="number" 
          value={amount}
          onChange={e => setAmount(e.target.value)}
          placeholder="Amount"
          className="bg-zinc-900 border border-zinc-800 p-2 rounded w-24"
        />
        <button 
          onClick={handleAward}
          className="bg-green-600 text-white px-4 py-2 rounded font-bold hover:bg-green-500"
        >
          AWARD
        </button>
      </div>

      <div className="bg-zinc-900 p-4 rounded border border-zinc-800 h-96 overflow-auto">
        {log.map((entry, i) => (
          <div key={i} className="mb-2 border-b border-zinc-800 pb-2">
            <span className="text-zinc-500 text-xs mr-2">[{entry.time}]</span>
            <span className="font-bold">{entry.msg}</span>
            {entry.data && (
              <pre className="text-xs text-green-400 mt-1 overflow-auto">
                {JSON.stringify(entry.data, null, 2)}
              </pre>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
