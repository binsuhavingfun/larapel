import { ArrowLeft, Camera, Check, ChevronRight, Copy, Download, History, ImagePlus, Link as LinkIcon, Loader2, RotateCcw, Share2, Sparkles, X } from 'lucide-react';
import { useState } from 'react';
import type { ReactNode } from 'react';
import { Link } from 'wouter';

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-[100dvh] overflow-x-hidden">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-5 md:px-9 md:py-7">
        <Link href="/" className="group flex items-center gap-2" data-testid="link-brand">
          <span className="flex h-9 w-9 rotate-[-8deg] items-center justify-center rounded-[11px] bg-primary text-primary-foreground transition-transform group-hover:rotate-0">
            <Camera size={18} strokeWidth={2.5} />
          </span>
          <span className="font-display text-[25px] font-semibold tracking-[-0.06em]">larapel</span>
        </Link>
        <nav className="flex items-center gap-2 text-sm font-semibold">
          <Link href="/history" className="flex items-center gap-2 rounded-full px-3 py-2 text-muted-foreground transition-colors hover:bg-card hover:text-foreground" data-testid="link-history">
            <History size={16} />
            <span className="hidden sm:inline">your strips</span>
          </Link>
          <Link href="/create" className="rounded-full bg-foreground px-4 py-2 text-background transition-transform hover:-translate-y-0.5" data-testid="link-make-strip">
            make one
          </Link>
        </nav>
      </header>
      <main>{children}</main>
      <footer className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 pb-7 pt-12 text-xs text-muted-foreground md:px-9">
        <span className="font-mono-ui uppercase tracking-[0.18em]">tiny memories, made tangible</span>
        <span className="hidden sm:block">a little booth for your people</span>
      </footer>
    </div>
  );
}

export function BackLink({ href, children = 'back' }: { href: string; children?: ReactNode }) {
  return <Link href={href} className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground" data-testid="link-back"><ArrowLeft size={15} />{children}</Link>;
}

export function PrimaryButton({ children, onClick, disabled, type = 'button', className = '', testId = 'button-primary' }: { children: ReactNode; onClick?: () => void; disabled?: boolean; type?: 'button' | 'submit'; className?: string; testId?: string }) {
  return <button type={type} onClick={onClick} disabled={disabled} data-testid={testId} className={`inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-bold text-primary-foreground shadow-[4px_4px_0_hsl(var(--foreground)/.13)] transition-all hover:-translate-y-0.5 hover:shadow-[6px_6px_0_hsl(var(--foreground)/.13)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}>{children}</button>;
}

export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-muted ${className}`} aria-label="loading" />;
}

export function EmptyStripArt() {
  return <div className="relative mx-auto flex aspect-[3/4] max-w-[150px] rotate-[-4deg] flex-col gap-2 rounded-sm bg-card p-2.5 paper-shadow"><div className="grid flex-1 grid-cols-2 gap-1.5"><span className="rounded-[2px] bg-secondary/70" /><span className="rounded-[2px] bg-accent/70" /><span className="rounded-[2px] bg-primary/65" /><span className="rounded-[2px] bg-foreground/15" /></div><span className="h-1.5 w-3/4 rounded-full bg-foreground/20" /><span className="h-1.5 w-1/2 rounded-full bg-foreground/10" /></div>;
}

export function StripPreview({ photos, note, placement, filter = 'mono', compact = false }: { photos: string[]; note: string; placement: 'front' | 'back'; filter: 'mono' | 'sepia'; compact?: boolean }) {
  const photoSlots = Math.max(photos.length, 1);
  return (
    <div className={`strip-paper ${compact ? 'w-[142px] p-2' : 'w-[min(78vw,280px)] p-3'} paper-shadow relative shrink-0 rotate-[1.3deg] bg-card text-foreground transition-transform`}>
      <div className="mb-2 flex items-center justify-between px-1 text-[8px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
        <span>larapel</span><span>no. {String(photoSlots).padStart(2, '0')}</span>
      </div>
      <div className={`grid gap-1 overflow-hidden bg-foreground/10 ${photoSlots > 2 ? 'grid-cols-2' : 'grid-cols-1'}`}>
        {photos.map((photo, index) => <img key={`${photo}-${index}`} src={photo} alt={`captured frame ${index + 1}`} className={`aspect-[4/3] w-full object-cover ${filter === 'mono' ? 'grayscale' : 'sepia-[.68]'} ${photoSlots === 3 && index === 0 ? 'col-span-2' : ''}`} data-testid={`img-strip-photo-${index}`} />)}
      </div>
      <div className={`flex flex-col ${compact ? 'gap-1.5 py-2' : 'gap-2.5 py-4'} ${placement === 'back' ? 'items-end text-right' : ''}`}>
        <p className={`${compact ? 'text-[9px]' : 'text-[13px]'} font-display leading-tight`}>{note || 'a little moment worth keeping'}</p>
        <div className="flex w-full items-center justify-between text-[7px] font-mono-ui uppercase tracking-[0.14em] text-muted-foreground">
          <span>{filter}</span><span>keep this close</span>
        </div>
      </div>
    </div>
  );
}

export function StepPill({ current, label, number }: { current: boolean; label: string; number: string }) {
  return <div className={`flex items-center gap-2 text-xs font-semibold ${current ? 'text-foreground' : 'text-muted-foreground'}`}><span className={`flex h-6 w-6 items-center justify-center rounded-full font-mono-ui text-[10px] ${current ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>{number}</span>{label}</div>;
}

export function ToastMessage({ children, onClose }: { children: ReactNode; onClose?: () => void }) {
  return <div className="fixed bottom-5 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-full bg-foreground px-4 py-3 text-xs font-semibold text-background shadow-xl" role="status" data-testid="status-toast"><Check size={15} className="text-accent" />{children}{onClose && <button onClick={onClose} className="ml-1 text-background/60 hover:text-background" data-testid="button-close-toast"><X size={14} /></button>}</div>;
}

export function ShareActions({ shareUrl, stripImage }: { shareUrl: string; stripImage?: string }) {
  const [message, setMessage] = useState('');
  const copy = async () => {
    await navigator.clipboard?.writeText(shareUrl);
    setMessage('link copied');
  };
  const share = async () => {
    try {
      const nativeShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function';
      if (nativeShare) await navigator.share({ title: 'a little larapel memory', url: shareUrl });
      else await copy();
      if (nativeShare) setMessage('ready to send');
    } catch {
      setMessage('share cancelled');
    }
  };
  const download = () => {
    if (!stripImage) return;
    const anchor = document.createElement('a');
    anchor.href = stripImage;
    anchor.download = 'larapel-memory.png';
    anchor.click();
    setMessage('saved to your device');
  };
  return <><div className="flex flex-wrap gap-2"><button onClick={share} className="inline-flex items-center gap-2 rounded-full bg-foreground px-4 py-2.5 text-xs font-bold text-background transition-transform hover:-translate-y-0.5" data-testid="button-share-strip"><Share2 size={14} />share</button><button onClick={copy} className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2.5 text-xs font-bold transition-colors hover:bg-muted" data-testid="button-copy-link"><Copy size={14} />copy link</button><button onClick={download} disabled={!stripImage} className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2.5 text-xs font-bold transition-colors hover:bg-muted disabled:opacity-40" data-testid="button-download-strip"><Download size={14} />save image</button></div>{message && <ToastMessage onClose={() => setMessage('')}>{message}</ToastMessage>}</>;
}

export function LoadingState({ label = 'developing your memory' }: { label?: string }) {
  return <div className="flex min-h-[45vh] flex-col items-center justify-center gap-4 text-center"><div className="relative flex h-16 w-16 items-center justify-center rounded-full border-2 border-primary/30"><span className="absolute inset-1 rounded-full border border-primary animate-pulse-ring" /><Loader2 size={21} className="animate-spin text-primary" /></div><p className="font-display text-xl">{label}</p></div>;
}

export const captureIcon = <ImagePlus size={18} />;
export const nextIcon = <ChevronRight size={17} />;
export const retakeIcon = <RotateCcw size={15} />;
export const linkIcon = <LinkIcon size={15} />;
export const sparkleIcon = <Sparkles size={15} />;