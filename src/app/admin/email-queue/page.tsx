"use client";
import { useEffect, useState } from 'react';
import { supabase } from '../../../supabaseClient';

export default function EmailQueueAdmin() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const fetchRows = async () => {
    setLoading(true);
    try {
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      const { data, count } = await supabase
        .from('email_deliveries')
        .select('*', { count: 'exact' })
        .order('sent_at', { ascending: false })
        .range(from, to);
      setRows(data || []);
      setTotal(count || 0);
    } catch (e) {
      console.error('Failed to fetch email_deliveries', e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRows();
    const channel = supabase.channel('public:email_deliveries')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'email_deliveries' }, (payload: any) => {
        // Keep page 1 as newest 20; refetch current page to reflect shifting
        fetchRows();
      })
      .subscribe();
    return () => { try { supabase.removeChannel(channel); } catch (e) {} };
  }, [page]);

  return (
    <div className="px-2 md:px-4 py-4">
      <h1 className="text-2xl font-extrabold mb-4 text-black">📧 Email Queue</h1>
      {loading ? <div className="text-black">Loading...</div> : (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 border text-left text-black">Sent At</th>
                <th className="p-2 border text-left text-black">User Email</th>
                <th className="p-2 border text-left text-black">Subject</th>
                <th className="p-2 border text-left text-black">Status</th>
                <th className="p-2 border text-left text-black">Provider</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="hover:bg-amber-50">
                  <td className="p-2 border text-black">{new Date(r.sent_at || r.created_at).toLocaleString()}</td>
                  <td className="p-2 border text-black">{r.to_email}</td>
                  <td className="p-2 border text-black">{r.subject}</td>
                  <td className="p-2 border text-black font-semibold">{r.status}</td>
                  <td className="p-2 border text-black">{r.provider || 'resend'}</td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td className="p-3 text-black" colSpan={5}>No email events yet.</td>
                </tr>
              )}
            </tbody>
          </table>
          {/* Pagination Controls */}
          <div className="flex flex-col sm:flex-row justify-end items-center gap-2 mt-3">
            <button
              className="px-3 py-1 rounded border bg-white text-gray-900 disabled:opacity-50"
              disabled={page === 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
            >
              Previous
            </button>
            <span className="text-sm">Page {page} of {Math.ceil(total / pageSize) || 1}</span>
            <button
              className="px-3 py-1 rounded border bg-white text-gray-900 disabled:opacity-50"
              disabled={page * pageSize >= total}
              onClick={() => setPage(p => p + 1)}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
