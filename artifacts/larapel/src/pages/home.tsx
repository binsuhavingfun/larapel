import { ArrowUpRight, Camera, CircleDot, History, MoveRight, Sparkles } from 'lucide-react';
import { Link } from 'wouter';
import { AppShell, EmptyStripArt } from '@/components/larapel';
import { useHealthCheck, getHealthCheckQueryKey } from '@workspace/api-client-react';

export default function Home() {
  const health = useHealthCheck({ query: { queryKey: getHealthCheckQueryKey(), staleTime: 60_000 } });
  return (
    <AppShell>
      <section className="mx-auto grid w-full max-w-6xl items-center gap-12 px-5 pb-14 pt-10 md:grid-cols-[1.05fr_.95fr] md:px-9 md:pb-24 md:pt-16">
        <div className="animate-rise">
          <div className="mb-6 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-primary"><span className="h-2 w-2 rounded-full bg-primary" />a tiny memory booth</div>
          <h1 className="max-w-xl font-display text-[clamp(3.6rem,10vw,7.4rem)] leading-[.87] tracking-[-0.07em]">make a<br /><span className="text-primary">little</span> keepsake.</h1>
          <p className="mt-7 max-w-md text-base leading-relaxed text-muted-foreground md:text-lg">Four frames, one note, and a strip you’ll actually want to send. Larapel turns an ordinary moment into a small thing worth keeping.</p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link href="/create" className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-bold text-primary-foreground shadow-[4px_4px_0_hsl(var(--foreground)/.13)] transition-all hover:-translate-y-0.5 hover:shadow-[6px_6px_0_hsl(var(--foreground)/.13)]" data-testid="link-start-capture">step inside <MoveRight size={17} /></Link>
            <Link href="/history" className="flex items-center gap-2 text-sm font-bold underline decoration-primary decoration-2 underline-offset-4" data-testid="link-see-history"><History size={16} />your old strips</Link>
          </div>
          <div className="mt-9 flex items-center gap-2 text-xs text-muted-foreground"><span className={`h-2 w-2 rounded-full ${health.isError ? 'bg-destructive' : 'bg-secondary'}`} />{health.isLoading ? 'checking the booth' : health.isError ? 'booth is taking a breather' : 'booth is ready when you are'}</div>
        </div>
        <div className="relative flex min-h-[420px] items-center justify-center md:min-h-[520px]">
          <div className="absolute left-[8%] top-[4%] h-28 w-28 rounded-full bg-accent/80 blur-[1px]" />
          <div className="absolute bottom-[3%] right-[4%] h-40 w-40 rounded-[45%] bg-secondary/50" />
          <div className="relative w-[min(77vw,340px)] rotate-[4deg] rounded-[2rem] border-2 border-foreground/10 bg-primary p-4 shadow-[12px_14px_0_hsl(var(--foreground)/.14)]">
            <div className="mb-3 flex items-center justify-between px-2 text-primary-foreground"><span className="font-display text-2xl">larapel</span><CircleDot size={18} /></div>
            <div className="rounded-[1.3rem] bg-foreground p-5">
              <div className="mb-4 flex items-center justify-between text-[10px] font-mono-ui uppercase tracking-[.14em] text-background/60"><span>memory booth</span><span>01—04</span></div>
              <div className="relative flex items-center justify-center rounded-xl bg-secondary/30 py-4"><EmptyStripArt /><span className="absolute bottom-3 right-3 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground"><Camera size={18} /></span></div>
              <div className="mt-4 flex items-center justify-between text-[10px] font-mono-ui uppercase tracking-[.14em] text-background/60"><span>press start</span><span>keep close</span></div>
            </div>
          </div>
        </div>
      </section>
      <section className="mx-auto grid w-full max-w-6xl gap-4 px-5 pb-14 md:grid-cols-3 md:px-9 md:pb-24">
        {[['01', 'capture the in-between', 'No posing required. Add one frame at a time, like a friend keeping the camera rolling.'], ['02', 'leave a little note', 'A sentence, a date, an inside joke. The back of the strip is yours.'], ['03', 'send it somewhere', 'Download it, share the link, or make another before the moment ends.']].map(([number, title, body], index) => <article key={number} className={`booth-card rounded-2xl border border-border bg-card p-6 ${index === 1 ? 'md:translate-y-7' : ''}`}><span className="font-mono-ui text-xs text-primary">{number}</span><h2 className="mt-12 font-display text-2xl leading-none">{title}</h2><p className="mt-3 text-sm leading-relaxed text-muted-foreground">{body}</p></article>)}
      </section>
      <section className="mx-5 mb-8 overflow-hidden rounded-[2rem] bg-foreground px-6 py-12 text-background md:mx-9 md:px-14 md:py-16">
        <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end"><div><div className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-[.2em] text-accent"><Sparkles size={14} /> made for your people</div><h2 className="max-w-xl font-display text-4xl leading-[.9] tracking-[-.04em] md:text-6xl">the best photos are<br /><span className="text-primary">a little accidental.</span></h2></div><Link href="/create" className="inline-flex items-center gap-2 text-sm font-bold underline decoration-accent decoration-2 underline-offset-4" data-testid="link-bottom-create">make the memory <ArrowUpRight size={16} /></Link></div>
      </section>
    </AppShell>
  );
}