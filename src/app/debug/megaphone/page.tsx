'use client';

import { useState } from 'react';

export default function MegaphoneDebug() {
  const [userId, setUserId] = useState('');
  const [status, setStatus] = useState('');

  const sendTest = async () => {
    setStatus('Sending...');
    try {
      const res = await fetch('/api/debug/megaphone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      const data = await res.json();
      setStatus(JSON.stringify(data, null, 2));
    } catch (e: any) {
      setStatus('Error: ' + e.message);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-8 font-mono">
      <h1 className="text-2xl font-bold mb-8 text-yellow-500">PROJECT MEGAPHONE TEST</h1>
      
      <div className="flex gap-4 mb-4">
        <input 
          type="text" 
          value={userId}
          onChange={e => setUserId(e.target.value)}
          placeholder="Telegram ID (e.g. 458184707)"
          className="bg-zinc-900 border border-zinc-800 p-2 rounded w-64"
        />
        <button 
          onClick={sendTest}
          className="bg-blue-600 text-white px-4 py-2 rounded font-bold"
        >
          SEND NUDGE
        </button>
      </div>

      <pre className="bg-zinc-900 p-4 rounded text-xs text-green-400">
        {status}
      </pre>
    </div>
  );
}
