"use client";

import React, { useEffect, useState } from "react";

declare global {
  interface Window {
    PaystackPop?: any;
    __NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY?: string;
  }
}

export default function DebugPaystackPage() {
  const [paystackPresent, setPaystackPresent] = useState(false);
  const [paystackObj, setPaystackObj] = useState<any>(null);
  const [runtimeKey, setRuntimeKey] = useState<string | null>(null);
  const [log, setLog] = useState<string[]>([]);

  useEffect(() => {
    setRuntimeKey((window as any).__NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || null);
    const p = (window as any).PaystackPop;
    setPaystackPresent(typeof p === "object" && typeof p.setup === "function");
    setPaystackObj(p || null);
  }, []);

  function append(msg: string) {
    setLog(l => [...l, `${new Date().toLocaleTimeString()}: ${msg}`]);
  }

  const tryInit = async () => {
    try {
      const p = (window as any).PaystackPop;
      if (!p || typeof p.setup !== "function") {
        append('PaystackPop.setup not available');
        return;
      }
      const key = runtimeKey || '';
      append(`Calling setup with key=${key ? 'present' : 'missing'}`);
      const handler = p.setup({
        key: key,
        email: 'test@example.com',
        amount: 100,
        ref: 'debug-' + Date.now(),
        callback: function(r: any) { append('callback called: ' + JSON.stringify(r)); },
        onClose: function() { append('onClose called'); }
      });
      append('setup returned: ' + (handler ? 'handler' : 'no-handler'));
      if (handler && typeof handler.openIframe === 'function') {
        append('calling openIframe()');
        try { handler.openIframe(); } catch (e) { append('openIframe error: ' + String(e)); }
      }
    } catch (e: any) {
      append('exception: ' + (e && e.message ? e.message : String(e)));
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Paystack debug</h1>

      <div className="mb-4">
        <div><strong>Runtime key:</strong> {runtimeKey ? <span className="text-green-700">present</span> : <span className="text-red-600">missing</span>}</div>
        <div className="mt-2"><strong>PaystackPop present:</strong> {paystackPresent ? <span className="text-green-700">yes</span> : <span className="text-red-600">no</span>}</div>
      </div>

      <div className="mb-4">
        <button className="px-4 py-2 bg-amber-500 text-white rounded" onClick={tryInit}>Attempt setup / open</button>
      </div>

      <div className="mb-4">
        <h2 className="font-semibold">Paystack object snapshot</h2>
        <pre className="bg-gray-100 p-3 rounded max-h-64 overflow-auto text-xs">{JSON.stringify(paystackObj, null, 2)}</pre>
      </div>

      <div>
        <h2 className="font-semibold">Activity log</h2>
        <div className="bg-black text-white p-3 rounded max-h-48 overflow-auto text-xs">
          {log.length === 0 ? <div className="text-gray-400">No activity yet</div> : log.map((l, i) => <div key={i}>{l}</div>)}
        </div>
      </div>
    </div>
  );
}
