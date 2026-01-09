import React from 'react';

export default function LoadingScreen({ label = 'Cargando...' }: { label?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-sm border border-slate-200">
        <div className="animate-pulse space-y-3">
          <div className="h-6 w-2/3 rounded bg-slate-200" />
          <div className="h-4 w-full rounded bg-slate-200" />
          <div className="h-4 w-5/6 rounded bg-slate-200" />
        </div>
        <p className="mt-4 text-sm text-slate-600">{label}</p>
      </div>
    </div>
  );
}
