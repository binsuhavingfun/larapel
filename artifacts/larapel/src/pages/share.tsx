import { useEffect, useMemo, useState } from 'react';
import { ArrowUpRight, RefreshCw } from 'lucide-react';
import { Link, useParams } from 'wouter';
import { getGetStripQueryKey, useGetStrip } from '@workspace/api-client-react';
import * as QRCode from 'qrcode';
import { AppShell, BackLink, LoadingState, ShareActions, StripPreview } from '@/components/larapel';

export default function SharePage() {
  const { id = '' } = useParams<{ id: string }>();
  const stripQuery = useGetStrip(id, { query: { queryKey: getGetStripQueryKey(id), enabled: Boolean(id) } });
  const shareUrl = useMemo(() => `${window.location.origin}/share/${id}`, [id]);
  const [downloadImage, setDownloadImage] = useState<string>();
  const [qrImage, setQrImage] = useState<string>();
  const photosKey = stripQuery.data?.photos.join('|') || '';
  const noteForImage = stripQuery.data?.note || '';
  const filterForImage = stripQuery.data?.filter || 'mono';

  useEffect(() => {
    let cancelled = false;
    QRCode.toDataURL(shareUrl, {
      width: 220,
      margin: 1,
      errorCorrectionLevel: 'M',
      color: { dark: '#27313a', light: '#f8f0e2' },
    }).then((image) => {
      if (!cancelled) setQrImage(image);
    }).catch(() => {
      if (!cancelled) setQrImage(undefined);
    });
    return () => { cancelled = true; };
  }, [shareUrl]);

  useEffect(() => {
    const strip = stripQuery.data;
    if (!strip?.photos.length) return;
    let cancelled = false;
    const width = 720;
    const frameHeight = 520;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = 90 + (strip.photos.length * frameHeight) + 170;
    const context = canvas.getContext('2d');
    if (!context) return;
    context.fillStyle = '#f8f0e2';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = '#27313a';
    context.font = '700 20px DM Mono, monospace';
    context.fillText('LARAPEL', 28, 42);
    context.font = '500 14px DM Mono, monospace';
    context.fillText(`MEMORY / ${strip.photos.length} FRAMES`, width - 220, 42);
    Promise.all(strip.photos.map((source) => new Promise<HTMLImageElement>((resolve, reject) => { const image = new Image(); image.onload = () => resolve(image); image.onerror = reject; image.src = source; }))).then((images) => {
      if (cancelled) return;
      images.forEach((image, index) => {
        const y = 70 + (index * frameHeight);
        context.filter = filterForImage === 'mono' ? 'grayscale(1)' : 'sepia(.75)';
        const scale = Math.max(width / image.width, frameHeight / image.height);
        const drawnWidth = image.width * scale;
        const drawnHeight = image.height * scale;
        context.drawImage(image, (width - drawnWidth) / 2, y + (frameHeight - drawnHeight) / 2, drawnWidth, drawnHeight);
      });
      context.filter = 'none';
      context.fillStyle = '#27313a';
      context.font = '600 28px Fraunces, Georgia, serif';
      context.fillText(noteForImage || 'a little moment worth keeping', 28, canvas.height - 90);
      context.font = '500 12px DM Mono, monospace';
      context.fillText('KEEP THIS CLOSE', width - 170, canvas.height - 35);
      setDownloadImage(canvas.toDataURL('image/png'));
    }).catch(() => setDownloadImage(strip.photos[0]));
    return () => { cancelled = true; };
  }, [photosKey, noteForImage, filterForImage]);

  if (stripQuery.isLoading) return <AppShell><LoadingState label="developing your strip" /></AppShell>;
  if (stripQuery.isError || !stripQuery.data) return <AppShell><div className="mx-auto flex min-h-[55vh] max-w-lg flex-col items-center justify-center px-5 text-center"><div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground"><RefreshCw size={24} /></div><h1 className="font-display text-4xl">that strip went missing.</h1><p className="mt-3 text-sm text-muted-foreground">The link may have expired, or the booth got shy.</p><Link href="/create" className="mt-7 inline-flex rounded-full bg-foreground px-5 py-3 text-sm font-bold text-background" data-testid="link-retry-create">make another</Link></div></AppShell>;
  const strip = stripQuery.data;
   return <AppShell><div className="mx-auto max-w-6xl px-5 pb-16 md:px-9"><div className="pt-4"><BackLink href="/">larapel home</BackLink></div><div className="grid items-center gap-12 pt-10 md:grid-cols-[.9fr_1.1fr] md:gap-20 md:pt-16"><div className="animate-rise"><div className="mb-5 flex items-center gap-2 text-xs font-bold uppercase tracking-[.2em] text-secondary-foreground"><span className="h-2 w-2 rounded-full bg-secondary" />your memory is ready</div><h1 className="font-display text-6xl leading-[.88] tracking-[-.06em] md:text-8xl">send it<br /><span className="text-primary">somewhere.</span></h1><p className="mt-7 max-w-sm text-base leading-relaxed text-muted-foreground">A tiny artifact from {new Date(strip.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}. Keep it close, or give it to the person who made it happen.</p><div className="mt-8"><ShareActions shareUrl={shareUrl} stripImage={downloadImage} /></div><p className="mt-4 break-all font-mono-ui text-[10px] text-muted-foreground" data-testid="text-share-url">{shareUrl}</p></div><div className="flex flex-col items-center gap-7"><StripPreview photos={strip.photos} note={strip.note} placement={strip.placement} filter={strip.filter} /><div className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 text-xs text-muted-foreground"><div className="flex h-16 w-16 shrink-0 items-center justify-center rounded bg-[#f8f0e2] p-1" aria-label="share QR code" data-testid="qr-share-pattern">{qrImage ? <img src={qrImage} alt="QR code for this Larapel" className="h-full w-full" /> : <span className="h-3 w-3 rounded-full bg-foreground/30" />}</div><span><strong className="block text-foreground">scan to keep it</strong>works for your whole group</span></div></div></div><section className="mt-24 flex flex-col items-start justify-between gap-5 border-t border-border pt-8 md:flex-row md:items-center"><div><p className="font-display text-3xl">want one with your people?</p><p className="mt-1 text-sm text-muted-foreground">Four frames are better than one.</p></div><Link href="/create" className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-bold text-primary-foreground transition-transform hover:-translate-y-0.5" data-testid="link-make-another">make your own <ArrowUpRight size={16} /></Link></section></div></AppShell>;
}