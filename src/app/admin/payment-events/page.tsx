"use client";
import { useEffect, useState } from 'react';
import { supabase } from '../../../supabaseClient';

export default function PaymentEventsAdmin() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEvents = async () => {
    setLoading(true);
    try {
  const { data } = await supabase.from('payment_events').select('*').neq('archived', true).order('created_at', { ascending: false }).limit(200);
      setEvents(data || []);
    } catch (e) {
      console.error('Failed to fetch payment_events', e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchEvents();
    const channel = supabase.channel('public:payment_events')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'payment_events' }, (payload: any) => {
        fetchEvents();
      })
      .subscribe();
    return () => { try { supabase.removeChannel(channel); } catch (e) {} };
  }, []);

  return (
    <div className="px-2 md:px-4">
      <h1 className="text-2xl font-bold mb-4">Payment Events</h1>
      {loading ? <div>Loading...</div> : (
        <div className="space-y-4">
          {events.map(ev => (
            <div key={ev.id} className="bg-white p-3 rounded shadow">
              <div className="text-xs text-gray-500">{new Date(ev.created_at).toLocaleString()}</div>
              <div className="font-semibold">{ev.event_type} — {ev.reference}</div>
              <pre className="text-xs bg-gray-100 p-2 rounded mt-2 overflow-x-auto">{JSON.stringify(ev.payload, null, 2)}</pre>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
