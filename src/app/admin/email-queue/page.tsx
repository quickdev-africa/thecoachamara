"use client";
import { useEffect, useState } from 'react';
import { supabase } from '../../../supabaseClient';

export default function EmailQueueAdmin() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRows = async () => {
    setLoading(true);
    try {
      const { data } = await supabase.from('email_queue').select('*').order('created_at', { ascending: false }).limit(200);
      setRows(data || []);
    } catch (e) {
      console.error('Failed to fetch email_queue', e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRows();
    const channel = supabase.channel('public:email_queue')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'email_queue' }, (payload: any) => {
        fetchRows();
      })
      .subscribe();
    return () => { try { supabase.removeChannel(channel); } catch (e) {} };
  }, []);

  return (
    <div className="px-2 md:px-4">
      <h1 className="text-2xl font-bold mb-4">Email Queue</h1>
      {loading ? <div>Loading...</div> : (
        <div className="space-y-4">
          {rows.map(r => (
            <div key={r.id} className="bg-white p-3 rounded shadow">
              <div className="text-xs text-gray-500">{new Date(r.created_at).toLocaleString()}</div>
              <div className="font-semibold">To: {r.to_email} — Attempts: {r.attempts}</div>
              <div className="text-sm mt-2">Subject: {r.subject}</div>
              <pre className="text-xs bg-gray-100 p-2 rounded mt-2 overflow-x-auto">{JSON.stringify(r.html, null, 2)}</pre>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
