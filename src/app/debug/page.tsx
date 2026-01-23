'use client';

import { useState } from 'react';

export default function DebugPage() {
  const [userId, setUserId] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const checkDatabase = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/debug?userId=${userId}`);
      const data = await res.json();
      setResult(data);
    } catch (err) {
      setResult({ error: 'Failed to fetch' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-8 font-mono">
      <h1 className="text-2xl font-bold mb-8 text-yellow-500">MOON DB DIAGNOSTIC</h1>
      
      <div className="mb-8 flex gap-4">
        <input 
          type="text" 
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          placeholder="Enter Telegram ID (e.g. 777000)"
          className="bg-zinc-900 border border-zinc-800 p-2 rounded w-64"
        />
        <button 
          onClick={checkDatabase}
          className="bg-yellow-500 text-black px-4 py-2 rounded font-bold"
          disabled={loading}
        >
          {loading ? 'CHECKING...' : 'RUN DIAGNOSTIC'}
        </button>
      </div>

      {result && (
        <div className="space-y-8">
          <section>
            <h2 className="text-sm font-bold text-zinc-500 mb-2 uppercase tracking-widest">Profile Record</h2>
            <pre className="bg-zinc-900 p-4 rounded border border-zinc-800 overflow-auto max-h-64">
              {JSON.stringify(result.profile, null, 2)}
            </pre>
          </section>

          <section>
            <h2 className="text-sm font-bold text-zinc-500 mb-2 uppercase tracking-widest">Referrals Made (Recruits)</h2>
            <pre className="bg-zinc-900 p-4 rounded border border-zinc-800 overflow-auto max-h-64 text-green-400">
              {JSON.stringify(result.referrals_made, null, 2)}
            </pre>
          </section>

          <section>
            <h2 className="text-sm font-bold text-zinc-500 mb-2 uppercase tracking-widest">Referral Received (Who referred this user?)</h2>
            <pre className="bg-zinc-900 p-4 rounded border border-zinc-800 overflow-auto max-h-64 text-blue-400">
              {JSON.stringify(result.referral_received, null, 2)}
            </pre>
          </section>
        </div>
      )}
    </div>
  );
}
