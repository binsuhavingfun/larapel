import { ArrowUpRight, History } from 'lucide-react';
import { Link } from 'wouter';
import { AppShell, EmptyStripArt } from '@/components/larapel';

export default function Home() {
  return (
    <AppShell>
      <section className="mx-auto flex min-h-[calc(100dvh-145px)] w-full max-w-5xl flex-col justify-center px-5 py-16 md:px-8 md:py-24">
        <div className="grid items-center gap-16 md:grid-cols-[1fr_280px] md:gap-24">
          <div className="animate-rise">
            <p className="mb-7 text-xs font-semibold uppercase tracking-[0.24em] text-secondary">larapel</p>
            <h1 className="max-w-2xl text-[clamp(4.6rem,16vw,10rem)] font-bold leading-[0.82] tracking-[-0.09em] text-foreground">larapel</h1>
            <p className="mt-8 max-w-sm text-base font-medium leading-relaxed text-secondary">small moments, made tangible.</p>
            <div className="mt-10 flex flex-wrap items-center gap-5">
              <Link href="/create" className="inline-flex items-center gap-3 border border-foreground bg-foreground px-5 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-background transition-colors hover:border-secondary hover:bg-secondary" data-testid="link-start-capture">
                make one <ArrowUpRight size={16} aria-hidden="true" />
              </Link>
              <Link href="/history" className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-secondary transition-colors hover:text-foreground" data-testid="link-see-history">
                <History size={15} aria-hidden="true" /> archive
              </Link>
            </div>
          </div>
          <div className="flex justify-center md:justify-end">
            <div className="animate-rise w-[min(54vw,230px)]" style={{ animationDelay: '100ms' }}>
              <EmptyStripArt />
            </div>
          </div>
        </div>
      </section>
    </AppShell>
  );
}