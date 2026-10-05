import { type ChangeEvent, useEffect, useRef, useState } from 'react';
import { Camera, Check, ChevronLeft, ChevronRight, Download, FlipHorizontal2, ImagePlus, Loader2, Share2, Trash2 } from 'lucide-react';
import { AppShell, BackLink, PrimaryButton, StripPreview, ToastMessage } from '@/components/larapel';
type Step = 'capture' | 'style' | 'note';
const filters = ['mono', 'sepia'] as const;

const FG = '#1a1a1a';
const BG = '#ffffff';

async function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

async function composeStrip(photos: string[], note: string, placement: 'front' | 'back', filter: 'mono' | 'sepia'): Promise<string> {
  const images = await Promise.all(photos.map(loadImage));
  const cols = images.length > 2 ? 2 : 1;
  const rows = Math.ceil(images.length / cols);
  const cellW = 480;
  const cellH = Math.round(cellW * 0.75);
  const gap = 6;
  const pad = 20;
  const noteH = 90;
  const width = pad * 2 + cellW * cols + gap * (cols - 1);
  const gridH = cellH * rows + gap * (rows - 1);
  const height = pad * 2 + gridH + noteH;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = BG;
  ctx.fillRect(0, 0, width, height);

  ctx.filter = filter === 'mono' ? 'grayscale(1)' : 'sepia(1)';
  images.forEach((img, index) => {
    const col = index % cols;
    const row = Math.floor(index / cols);
    const x = pad + col * (cellW + gap);
    const y = pad + row * (cellH + gap);
    const scale = Math.max(cellW / img.width, cellH / img.height);
    const sw = cellW / scale;
    const sh = cellH / scale;
    const sx = (img.width - sw) / 2;
    const sy = (img.height - sh) / 2;
    ctx.drawImage(img, sx, sy, sw, sh, x, y, cellW, cellH);
  });
  ctx.filter = 'none';

  ctx.fillStyle = FG;
  ctx.font = '500 20px "Space Grotesk", system-ui, sans-serif';
  ctx.textBaseline = 'top';
  const noteY = pad + gridH + 16;
  const maxWidth = width - pad * 2;
  const words = (note || ' ').split(' ');
  let line = '';
  let lineY = noteY;
  const lineHeight = 26;
  const lines: string[] = [];
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  lines.slice(0, 2).forEach((text, i) => {
    ctx.textAlign = placement === 'back' ? 'right' : 'left';
    const x = placement === 'back' ? width - pad : pad;
    ctx.fillText(text, x, lineY + i * lineHeight);
  });

  ctx.strokeStyle = FG;
  ctx.lineWidth = 2;
  ctx.strokeRect(1, 1, width - 2, height - 2);

  return canvas.toDataURL('image/png');
}

export default function Create() {
  const fileRef = useRef<HTMLInputElement>(null); const videoRef = useRef<HTMLVideoElement>(null); const streamRef = useRef<MediaStream | null>(null); const startedCamera = useRef(false);
  const [photos, setPhotos] = useState<string[]>([]); const [step, setStep] = useState<Step>('capture'); const [note, setNote] = useState(''); const [placement, setPlacement] = useState<'front' | 'back'>('front'); const [filter, setFilter] = useState<'mono' | 'sepia'>('mono'); const [toast, setToast] = useState(''); const [cameraOpen, setCameraOpen] = useState(false); const [finishedImage, setFinishedImage] = useState<string | null>(null); const [composing, setComposing] = useState(false);
  const stopCamera = () => { streamRef.current?.getTracks().forEach(t => t.stop()); streamRef.current = null; setCameraOpen(false); };
  useEffect(() => () => { streamRef.current?.getTracks().forEach(t => t.stop()); }, []);
  const openCamera = async () => { if (!navigator.mediaDevices?.getUserMedia) return fileRef.current?.click(); try { const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } }, audio: false }); streamRef.current = stream; setCameraOpen(true); requestAnimationFrame(() => { if (videoRef.current) { videoRef.current.srcObject = stream; void videoRef.current.play(); } }); } catch { fileRef.current?.click(); } };
  useEffect(() => { if (!startedCamera.current) { startedCamera.current = true; void openCamera(); } }, [openCamera]);
  const capture = () => { const video = videoRef.current; if (!video || !video.videoWidth || photos.length >= 4) return; const canvas = document.createElement('canvas'); canvas.width = video.videoWidth; canvas.height = video.videoHeight; canvas.getContext('2d')?.drawImage(video, 0, 0, canvas.width, canvas.height); setPhotos(current => [...current, canvas.toDataURL('image/jpeg', .9)]); stopCamera(); };
  const addPhoto = (file: File) => { if (photos.length >= 4) return; const reader = new FileReader(); reader.onload = () => setPhotos(current => current.length < 4 ? [...current, String(reader.result)] : current); reader.readAsDataURL(file); };
  const onFileChange = (event: ChangeEvent<HTMLInputElement>) => { Array.from(event.target.files || []).slice(0, 4 - photos.length).forEach(addPhoto); event.target.value = ''; };
  const finish = async () => {
    setComposing(true);
    try {
      const image = await composeStrip(photos, note.trim(), placement, filter);
      setFinishedImage(image);
    } catch {
      setToast('try again');
    } finally {
      setComposing(false);
    }
  };
  const download = () => { if (!finishedImage) return; const anchor = document.createElement('a'); anchor.href = finishedImage; anchor.download = 'larapel.png'; anchor.click(); setToast('saved'); };
  const share = async () => {
    if (!finishedImage) return;
    try {
      const response = await fetch(finishedImage);
      const blob = await response.blob();
      const file = new File([blob], 'larapel.png', { type: 'image/png' });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: 'Larapel' });
        setToast('shared');
      } else {
        download();
      }
    } catch {
      /* user cancelled share, no toast needed */
    }
  };
  const startOver = () => { setPhotos([]); setNote(''); setFinishedImage(null); setStep('capture'); startedCamera.current = false; };
  const stepIndex = ['capture', 'style', 'note'].indexOf(step);

  if (finishedImage) {
    return <AppShell><div className="mx-auto flex min-h-[calc(100dvh-65px)] max-w-md flex-col items-center gap-5 px-4 pb-6 pt-8 sm:px-6">
      <img src={finishedImage} alt="finished larapel" className="w-full border border-foreground" data-testid="img-finished-strip" />
      <div className="flex w-full gap-2">
        <PrimaryButton onClick={share} className="flex-1" testId="button-share-strip"><Share2 size={15} />share</PrimaryButton>
        <button onClick={download} className="inline-flex flex-1 items-center justify-center gap-2 border border-secondary px-5 py-3 text-xs font-bold text-foreground" data-testid="button-download-strip"><Download size={15} />download</button>
      </div>
      <button onClick={startOver} className="text-xs font-semibold text-secondary hover:text-foreground" data-testid="button-start-over">make another</button>
    </div>{toast ? <ToastMessage onClose={() => setToast('')}>{toast}</ToastMessage> : null}</AppShell>;
  }

  return <AppShell><div className="mx-auto min-h-[calc(100dvh-65px)] max-w-4xl px-4 pb-6 sm:px-6"><div className="pt-4"><BackLink href="/" /></div><div className="mt-4 flex gap-1" aria-label="progress">{[0,1,2].map(index => <span key={index} className={`h-1 flex-1 ${stepIndex >= index ? 'bg-accent' : 'bg-muted'}`} />)}</div>
    {step === 'capture' ? <section className="relative mt-4 flex min-h-[calc(100dvh-130px)] flex-col"><div className="grid flex-1 gap-1 overflow-hidden bg-muted sm:grid-cols-3">{photos.length ? photos.map((photo, index) => <div key={photo} className="group relative min-h-40"><img src={photo} alt={`photo ${index + 1}`} className="h-full w-full object-cover grayscale" /><button onClick={() => setPhotos(current => current.filter((_, i) => i !== index))} className="absolute right-2 top-2 grid h-8 w-8 place-items-center bg-background" aria-label="remove photo"><Trash2 size={14} /></button></div>) : <div className="col-span-full grid min-h-[55vh] place-items-center"><Camera size={42} className="text-secondary" /></div>}</div><div className="flex items-center justify-between py-4"><button onClick={() => fileRef.current?.click()} disabled={photos.length >= 4} aria-label="photos" className="grid h-11 w-11 place-items-center border border-secondary text-secondary"><ImagePlus size={18} /></button><button onClick={openCamera} disabled={photos.length >= 4} aria-label="camera" className="grid h-16 w-16 place-items-center rounded-full border-[5px] border-background bg-accent"><Camera size={24} /></button><PrimaryButton onClick={() => setStep('style')} disabled={!photos.length} testId="button-next-style"><ChevronRight size={18} /></PrimaryButton></div><input ref={fileRef} type="file" accept="image/*" capture="environment" multiple onChange={onFileChange} className="hidden" />{cameraOpen ? <div className="fixed inset-0 z-50 flex flex-col bg-foreground p-4"><video ref={videoRef} muted playsInline className="min-h-0 flex-1 object-cover" /><div className="flex items-center justify-between py-5"><button onClick={stopCamera} aria-label="close camera" className="h-12 w-12 text-background"><ChevronLeft /></button><button onClick={capture} aria-label="capture" className="grid h-16 w-16 place-items-center rounded-full border-[5px] border-background bg-accent"><Camera size={23} /></button><span className="h-12 w-12" /></div></div> : null}</section> : null}
    {step === 'style' ? <section className="pt-6"><div className="grid grid-cols-2 gap-2">{filters.map(option => <button key={option} onClick={() => setFilter(option)} aria-label={`select ${option}`} className={`border p-1 ${filter === option ? 'border-2 border-accent' : 'border-border'}`}><img src={photos[0]} alt="" className={`aspect-square w-full object-cover ${option === 'mono' ? 'grayscale' : 'sepia'}`} /></button>)}</div><div className="mt-6 flex justify-between"><button onClick={() => setStep('capture')} aria-label="back" className="grid h-11 w-11 place-items-center border border-secondary"><ChevronLeft size={18} /></button><PrimaryButton onClick={() => setStep('note')} testId="button-next-note">next <ChevronRight size={16} /></PrimaryButton></div></section> : null}
    {step === 'note' ? <section className="flex flex-col items-center gap-5 pt-5"><StripPreview photos={photos} note={note} placement={placement} filter={filter} /><div className="flex w-full max-w-md border-b border-secondary"><textarea value={note} onChange={event => setNote(event.target.value.slice(0, 180))} placeholder="add a note" aria-label="add a note" className="min-h-14 flex-1 resize-none bg-transparent py-3 text-base outline-none placeholder:text-secondary" /><button onClick={() => setPlacement(current => current === 'front' ? 'back' : 'front')} aria-label="toggle note placement" className="grid w-11 place-items-center text-secondary"><FlipHorizontal2 size={17} /></button></div><div className="flex w-full max-w-md items-center justify-end"><div className="flex gap-2"><button onClick={() => setStep('style')} aria-label="back" className="grid h-11 w-11 place-items-center border border-secondary"><ChevronLeft size={18} /></button><PrimaryButton onClick={finish} disabled={composing} testId="button-save-strip">{composing ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}save</PrimaryButton></div></div></section> : null}</div>{toast ? <ToastMessage onClose={() => setToast('')}>{toast}</ToastMessage> : null}</AppShell>;
}
