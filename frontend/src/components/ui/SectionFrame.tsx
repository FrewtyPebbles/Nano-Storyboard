import type { ReactNode } from 'react';

interface SectionFrameProps {
  title: string;
  subtitle: string;
  children: ReactNode;
}

function SectionFrame({ title, subtitle, children }: SectionFrameProps) {
  return (
    <section className="mx-auto w-full max-w-5xl rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-xl shadow-slate-200/70 backdrop-blur sm:p-10">
      <header className="mb-8 space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">{title}</h1>
        <p className="text-sm text-slate-600 sm:text-base">{subtitle}</p>
      </header>
      {children}
    </section>
  );
}

export default SectionFrame;
