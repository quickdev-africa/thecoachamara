"use client";
import { CheckCircle2, Sparkles } from "lucide-react";

export default function QuantumMachineThankYou() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.08),_transparent_28%),linear-gradient(to_bottom,_#ffffff,_#fcfcfc)] flex items-center justify-center px-5">
      <div className="w-full max-w-lg text-center">

        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-700 text-white shadow-lg shadow-emerald-100">
            <Sparkles className="h-4 w-4" />
          </div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-zinc-800">
            Quantum Energy
          </p>
        </div>

        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 border border-emerald-100 mx-auto mb-8">
          <CheckCircle2 className="h-10 w-10 text-emerald-600" />
        </div>

        <h1 className="text-4xl font-bold tracking-tight text-zinc-950 sm:text-5xl">
          Your Entry Has Been Received
        </h1>

        <p className="mt-6 text-xl leading-8 text-zinc-500 sm:text-2xl">
          We would be in touch with you shortly.
        </p>

      </div>
    </div>
  );
}
