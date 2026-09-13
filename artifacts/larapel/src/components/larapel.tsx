import { ArrowLeft, Camera, Check, ChevronRight, Copy, Download, History, ImagePlus, Link as LinkIcon, Loader2, RotateCcw, Share2, X } from 'lucide-react';
import { useState } from 'react';
import type { ReactNode } from 'react';
import { Link } from 'wouter';

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-[100dvh] overflow-x-hidden">
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between border-b border-secondary/60 px-5 py-5 md:px-8">
        <Link href="/" className="flex items-center gap-2 text-foreground" data-testid="link-brand">
          <span className="flex h-7 w-7 items-center justify-center bg-foreground text-background" aria-hidden="true">
            <Camera size={14} strokeWidth={2.5} />
          </span>
          <span className="text-xl font-bold tracking-[-0.06em]">larapel</span>
        </Link>
        <nav className="flex items-center gap-5 text-xs font-medium uppercase tracking-[0.14em] text-secondary">
          <Link href="/history" className="flex items-center gap-2 transition-colors hover:text-foreground" data-testid="link-history">
            <History size={14} aria-hidden="true" />
            <span className="hidden sm:inline">archive</span>
            <span className="sm:hidden">history</span>
          </Link>
          <Link href="/create" className="border border-foreground bg-foreground px-3 py-2 text-[11px] font-semibold text-background transition-colors hover:bg-secondary hover:border-secondary" data-testid="link-make-strip">
            make one
          </Link>
        </nav>
      </header>
      <main>{children}</main>
      <footer className="mx-auto flex w-full max-w-5xl items-center justify-between border-t border-secondary/60 px-5 py-6 text-[10px] uppercase tracking-[0.18em] text-secondary md:px-8">
        <span>larapel</span>
        <span className="hidden sm:block">keep close</span>
      </footer>
    </div>
  );
}

export function BackLink({ href, children = 'back' }: { href: string; children?: ReactNode }) {
  return (
    <Link href={href} className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.14em] text-secondary transition-colors hover:text-foreground" data-testid="link-back">
      <ArrowLeft size={14} aria-hidden="true" />
      {children}
    </Link>
  );
}

export function PrimaryButton({
  children,
  onClick,
  disabled,
  type = 'button',
  className = '',
  testId = 'button-primary',
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit';
  className?: string;
  testId?: string;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      data-testid={testId}
      className={`inline-flex items-center justify-center gap-2 border border-foreground bg-foreground px-5 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-background transition-colors hover:bg-secondary hover:border-secondary active:bg-secondary disabled:cursor-not-allowed disabled:opacity-45 ${className}`}
    >
      {children}
    </button>
  );
}

export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse border border-secondary/35 bg-muted ${className}`} aria-label="loading" />;
}

export function EmptyStripArt() {
  return (
    <div className="relative mx-auto flex aspect-[3/4] max-w-[150px] flex-col gap-2 border border-foreground bg-background p-2.5">
      <div className="grid flex-1 grid-cols-2 gap-1.5">
        <span className="border border-secondary bg-secondary/35" />
        <span className="border border-secondary bg-muted" />
        <span className="border border-secondary bg-secondary/60" />
        <span className="border border-secondary bg-background" />
      </div>
      <span className="h-1.5 w-3/4 bg-foreground/70" />
      <span className="h-1.5 w-1/2 bg-secondary/60" />
    </div>
  );
}

export function StripPreview({
  photos,
  note,
  placement,
  filter = 'mono',
  compact = false,
}: {
  photos: string[];
  note: string;
  placement: 'front' | 'back';
  filter: 'mono' | 'sepia';
  compact?: boolean;
}) {
  const photoSlots = Math.max(photos.length, 1);
  return (
    <div className={`relative shrink-0 border border-foreground bg-background ${compact ? 'w-[142px] p-2' : 'w-[min(78vw,280px)] p-3'}`}>
      <div className="mb-2 flex items-center justify-between px-1 text-[8px] font-semibold uppercase tracking-[0.2em] text-secondary">
        <span>larapel</span><span>{String(photoSlots).padStart(2, '0')}</span>
      </div>
      <div className={`grid gap-1 overflow-hidden border border-foreground/70 bg-muted ${photoSlots > 2 ? 'grid-cols-2' : 'grid-cols-1'}`}>
        {photos.length ? photos.map((photo, index) => (
          <img
            key={`${photo}-${index}`}
            src={photo}
            alt={`captured frame ${index + 1}`}
            className={`aspect-[4/3] w-full object-cover ${filter === 'mono' ? 'grayscale' : 'sepia'} ${photoSlots === 3 && index === 0 ? 'col-span-2' : ''}`}
            data-testid={`img-strip-photo-${index}`}
          />
        )) : <div className="aspect-[4/3] bg-muted" aria-hidden="true" />}
      </div>
      <div className={`flex flex-col ${compact ? 'gap-1.5 py-2' : 'gap-2.5 py-4'} ${placement === 'back' ? 'items-end text-right' : ''}`}>
        <p className={`${compact ? 'text-[9px]' : 'text-[13px]'} min-h-[1em] font-medium leading-tight`}>
          {note || ' '}
        </p>
        <div className="flex w-full items-center justify-between text-[7px] font-semibold uppercase tracking-[0.14em] text-secondary">
          <span>{filter}</span><span>keep close</span>
        </div>
      </div>
    </div>
  );
}

export function StepPill({ current, label, number }: { current: boolean; label: string; number: string }) {
  return (
    <div className={`flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] ${current ? 'text-foreground' : 'text-secondary'}`}>
      <span className={`h-1.5 w-10 ${current ? 'bg-secondary' : 'bg-secondary/25'}`} aria-hidden="true" />
      <span className="sr-only">{number}</span>
      {label}
    </div>
  );
}

export function ToastMessage({ children, onClose }: { children: ReactNode; onClose?: () => void }) {
  return (
    <div className="fixed bottom-5 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 border border-background bg-foreground px-4 py-3 text-xs font-semibold text-background" role="status" data-testid="status-toast">
      <Check size={15} aria-hidden="true" />
      {children}
      {onClose && (
        <button onClick={onClose} className="ml-1 text-background/70 hover:text-background" aria-label="close message" data-testid="button-close-toast">
          <X size={14} />
        </button>
      )}
    </div>
  );
}

export function ShareActions({ shareUrl, stripImage }: { shareUrl: string; stripImage?: string }) {
  const [message, setMessage] = useState('');
  const copy = async () => {
    await navigator.clipboard?.writeText(shareUrl);
    setMessage('link copied');
  };
  const share = async () => {
    try {
      if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
        await navigator.share({ title: 'Larapel', url: shareUrl });
        setMessage('shared');
      } else {
        await copy();
      }
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
    setMessage('saved');
  };
  return (
    <>
      <div className="flex flex-wrap gap-2">
        <button onClick={share} className="inline-flex items-center gap-2 border border-foreground bg-foreground px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.1em] text-background transition-colors hover:border-secondary hover:bg-secondary" data-testid="button-share-strip">
          <Share2 size={14} aria-hidden="true" />share
        </button>
        <button onClick={copy} className="inline-flex items-center gap-2 border border-secondary px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.1em] text-foreground transition-colors hover:bg-muted" data-testid="button-copy-link">
          <Copy size={14} aria-hidden="true" />copy
        </button>
        <button onClick={download} disabled={!stripImage} className="inline-flex items-center gap-2 border border-secondary px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.1em] text-foreground transition-colors hover:bg-muted disabled:opacity-40" data-testid="button-download-strip">
          <Download size={14} aria-hidden="true" />download
        </button>
      </div>
      {message && <ToastMessage onClose={() => setMessage('')}>{message}</ToastMessage>}
    </>
  );
}

export function LoadingState({ label = 'loading' }: { label?: string }) {
  return (
    <div className="flex min-h-[45vh] flex-col items-center justify-center gap-4 text-center">
      <div className="h-1 w-28 overflow-hidden bg-secondary/20" aria-hidden="true">
        <span className="block h-full w-1/2 animate-pulse bg-secondary" />
      </div>
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-secondary">{label}</p>
    </div>
  );
}

export const captureIcon = <ImagePlus size={18} />;
export const nextIcon = <ChevronRight size={17} />;
export const retakeIcon = <RotateCcw size={15} />;
export const linkIcon = <LinkIcon size={15} />;
export const sparkleIcon = <Loader2 size={15} />;