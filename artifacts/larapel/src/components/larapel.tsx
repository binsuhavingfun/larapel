import { ArrowLeft, Check, Download, History, Share2, X } from 'lucide-react';
import { useState } from 'react';
import type { ReactNode } from 'react';
import { Link } from 'wouter';

export function AppShell({ children }: { children: ReactNode }) {
  return <div className="min-h-[100dvh] overflow-x-hidden bg-background">
    <header className="mx-auto flex w-full max-w-6xl items-center justify-between border-b border-border px-4 py-4 sm:px-6">
      <Link href="/" className="text-xl font-bold tracking-[-.07em] text-foreground" data-testid="link-brand">larapel</Link>
      <nav className="flex items-center gap-3">
        <Link href="/history" aria-label="archive" className="grid h-9 w-9 place-items-center text-secondary hover:text-foreground" data-testid="link-history"><History size={17} /></Link>
        <Link href="/create" className="border border-accent bg-accent px-3 py-2 text-xs font-bold text-foreground" data-testid="link-make-strip">make one</Link>
      </nav>
    </header>
    <main>{children}</main>
  </div>;
}

export function BackLink({ href, children = 'back' }: { href: string; children?: ReactNode }) {
  return <Link href={href} className="inline-flex items-center gap-2 text-xs font-semibold text-secondary hover:text-foreground" data-testid="link-back"><ArrowLeft size={14} />{children}</Link>;
}

export function PrimaryButton({ children, onClick, disabled, type = 'button', className = '', testId = 'button-primary' }: { children: ReactNode; onClick?: () => void; disabled?: boolean; type?: 'button' | 'submit'; className?: string; testId?: string }) {
  return <button type={type} onClick={onClick} disabled={disabled} data-testid={testId} className={`inline-flex items-center justify-center gap-2 border border-accent bg-accent px-5 py-3 text-xs font-bold text-foreground transition-colors hover:bg-[#c79427] disabled:cursor-not-allowed disabled:opacity-45 ${className}`}>{children}</button>;
}

export function EmptyStripArt() {
  return <div className="grid aspect-[3/4] w-full grid-cols-2 gap-1 border border-foreground bg-background p-2"><span className="bg-[#d7d7d7]" /><span className="bg-[#9d9d9d]" /><span className="bg-[#eeeeee]" /><span className="bg-[#b8b8b8]" /></div>;
}

export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse bg-muted ${className}`} aria-label="loading" />;
}

export function StripPreview({ photos, note, placement, filter = 'mono', compact = false }: { photos: string[]; note: string; placement: 'front' | 'back'; filter: 'mono' | 'sepia'; compact?: boolean }) {
  const count = Math.max(photos.length, 1);
  return <div className={`shrink-0 border border-foreground bg-background ${compact ? 'w-[122px] p-1.5' : 'w-[min(82vw,330px)] p-2.5'}`}><div className={`grid gap-1 ${count > 2 ? 'grid-cols-2' : 'grid-cols-1'}`}>{photos.length ? photos.map((photo, index) => <img key={`${photo}-${index}`} src={photo} alt={`captured frame ${index + 1}`} className={`aspect-[4/3] w-full object-cover ${filter === 'mono' ? 'grayscale' : 'sepia'}`} data-testid={`img-strip-photo-${index}`} />) : <div className="aspect-[4/3] bg-muted" />}</div><div className={`min-h-12 px-1 py-2 ${placement === 'back' ? 'text-right' : ''}`}><p className="text-xs font-medium leading-tight">{note || ' '}</p></div></div>;
}

export function ToastMessage({ children, onClose }: { children: ReactNode; onClose?: () => void }) { return <div className="fixed bottom-5 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 border border-foreground bg-foreground px-4 py-3 text-xs font-semibold text-background" role="status"><Check size={14} />{children}{onClose && <button onClick={onClose} aria-label="close"><X size={14} /></button>}</div>; }

export function ShareActions({ shareUrl, stripImage }: { shareUrl: string; stripImage?: string }) {
  const [message, setMessage] = useState('');
  const share = async () => { try { if (navigator.share) await navigator.share({ title: 'Larapel', url: shareUrl }); else await navigator.clipboard?.writeText(shareUrl); setMessage('shared'); } catch { setMessage(''); } };
  const download = () => { if (!stripImage) return; const anchor = document.createElement('a'); anchor.href = stripImage; anchor.download = 'larapel.png'; anchor.click(); setMessage('saved'); };
  return <><div className="flex gap-2"><PrimaryButton onClick={share} testId="button-share-strip"><Share2 size={15} />share</PrimaryButton><button onClick={download} disabled={!stripImage} className="inline-flex items-center gap-2 border border-secondary px-5 py-3 text-xs font-bold text-foreground disabled:opacity-40" data-testid="button-download-strip"><Download size={15} />download</button></div>{message && <ToastMessage onClose={() => setMessage('')}>{message}</ToastMessage>}</>;
}

export function LoadingState({ label: _label }: { label?: string }) { return <div className="grid min-h-[60vh] place-items-center"><span className="h-1 w-20 animate-pulse bg-accent" /></div>; }
