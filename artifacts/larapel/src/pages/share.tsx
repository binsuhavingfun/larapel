import { useEffect, useMemo, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { useParams } from 'wouter';
import { getGetStripQueryKey, useGetStrip } from '@workspace/api-client-react';
import * as QRCode from 'qrcode';
import { AppShell, BackLink, LoadingState, ShareActions, StripPreview } from '@/components/larapel';
export default function SharePage() {
  const { id = '' } = useParams<{ id: string }>(); const stripQuery = useGetStrip(id, { query: { queryKey: getGetStripQueryKey(id), enabled: Boolean(id) } }); const shareUrl = useMemo(() => `${window.location.origin}/share/${id}`, [id]); const [qrImage, setQrImage] = useState<string>(); const [downloadImage, setDownloadImage] = useState<string>();
  useEffect(() => { QRCode.toDataURL(shareUrl, { width: 160, margin: 1, color: { dark: '#1A1A1A', light: '#FFFFFF' } }).then(setQrImage).catch(() => setQrImage(undefined)); }, [shareUrl]);
  useEffect(() => { const photo = stripQuery.data?.photos[0]; if (photo) setDownloadImage(photo); }, [stripQuery.data?.photos]);
  if (stripQuery.isLoading) return <AppShell><LoadingState /></AppShell>;
  if (stripQuery.isError || !stripQuery.data) return <AppShell><div className="grid min-h-[70vh] place-items-center"><RefreshCw className="text-secondary" /></div></AppShell>;
  const strip = stripQuery.data;
  return <AppShell><div className="mx-auto max-w-4xl px-4 pb-10 sm:px-6"><div className="pt-4"><BackLink href="/" /></div><section className="flex flex-col items-center gap-6 pt-6"><StripPreview photos={strip.photos} note={strip.note} placement={strip.placement} filter={strip.filter} /><div className="flex items-center gap-4">{qrImage ? <img src={qrImage} alt="QR code" className="h-20 w-20 border border-border p-1" /> : null}<ShareActions shareUrl={shareUrl} stripImage={downloadImage} /></div></section></div></AppShell>;
}
