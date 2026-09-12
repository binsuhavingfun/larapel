import { type ChangeEvent, useEffect, useRef, useState } from 'react';
import { Camera, Check, ChevronLeft, ChevronRight, FlipHorizontal2, ImagePlus, Loader2, NotebookPen, Palette, Trash2 } from 'lucide-react';
import { useLocation } from 'wouter';
import { getListStripsQueryKey, useCreateStrip } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import type { StripInput } from '@workspace/api-client-react';
import { AppShell, BackLink, PrimaryButton, StepPill, StripPreview, ToastMessage } from '@/components/larapel';

type CaptureStep = 'capture' | 'style' | 'note';

export default function Create() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [photos, setPhotos] = useState<string[]>([]);
  const [step, setStep] = useState<CaptureStep>('capture');
  const [note, setNote] = useState('');
  const [placement, setPlacement] = useState<'front' | 'back'>('front');
  const [filter, setFilter] = useState<'mono' | 'sepia'>('mono');
  const [toast, setToast] = useState('');
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const createStrip = useCreateStrip();

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setCameraOpen(false);
  };

  useEffect(() => () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
  }, []);

  const openCamera = async () => {
    setCameraError('');
    if (!navigator.mediaDevices?.getUserMedia) {
      fileRef.current?.click();
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } },
        audio: false,
      });
      streamRef.current = stream;
      setCameraOpen(true);
      requestAnimationFrame(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          void videoRef.current.play();
        }
      });
    } catch {
      setCameraError('camera access was unavailable — choose a photo instead');
      fileRef.current?.click();
    }
  };

  const captureFromCamera = () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth || photos.length >= 4) return;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d')?.drawImage(video, 0, 0, canvas.width, canvas.height);
    setPhotos((current) => [...current, canvas.toDataURL('image/jpeg', 0.9)]);
    stopCamera();
  };

  const addPhoto = (file: File) => {
    if (photos.length >= 4) return;
    const reader = new FileReader();
    reader.onload = () => setPhotos((current) => [...current, String(reader.result)]);
    reader.readAsDataURL(file);
  };
  const onFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) addPhoto(file);
    event.target.value = '';
  };
  const removePhoto = (index: number) => setPhotos((current) => current.filter((_, photoIndex) => photoIndex !== index));
  const goNext = () => {
    if (step === 'capture' && photos.length) setStep('style');
    else if (step === 'style') setStep('note');
  };
  const save = () => {
    const payload: StripInput = { photos, note: note.trim(), placement, filter };
    createStrip.mutate({ data: payload }, { onSuccess: (strip) => { queryClient.invalidateQueries({ queryKey: getListStripsQueryKey() }); setToast('your strip is ready'); setTimeout(() => setLocation(`/share/${strip.id}`), 480); }, onError: () => setToast('the booth missed that — try again') });
  };
  const stepIndex = step === 'capture' ? 0 : step === 'style' ? 1 : 2;
  const title = step === 'capture' ? 'get in the frame.' : step === 'style' ? 'make it yours.' : 'leave a little note.';

   return <AppShell><div className="mx-auto max-w-6xl px-5 pb-16 md:px-9"><div className="pt-4"><BackLink href="/" /></div><div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 border-b border-border pb-6"><StepPill number="01" label="capture" current={step === 'capture'} /><StepPill number="02" label="style" current={step === 'style'} /><StepPill number="03" label="note + save" current={step === 'note'} /></div>
    <div className="grid gap-10 pt-9 md:grid-cols-[.82fr_1.18fr] md:gap-16 md:pt-14">
      <div className="animate-rise"><div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[.2em] text-primary"><span className="h-2 w-2 rounded-full bg-primary" />frame {String(stepIndex + 1).padStart(2, '0')} / 03</div><h1 className="font-display text-5xl leading-[.92] tracking-[-.06em] md:text-7xl">{title}</h1><p className="mt-5 max-w-sm text-sm leading-relaxed text-muted-foreground">{step === 'capture' ? 'Take one to four photos. Imperfect is the whole point.' : step === 'style' ? 'Pick the ink and decide where your message lives.' : 'Write the thing you’ll want to remember when this pops up later.'}</p>
        <div className="mt-9 hidden rounded-2xl border border-border bg-card p-5 md:block"><div className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent"><NotebookPen size={16} /></span><div><p className="text-sm font-bold">the booth rules</p><p className="mt-1 text-xs text-muted-foreground">There are no retakes in real life. Here, there are plenty.</p></div></div></div>
      </div>
      <div className="min-w-0">
         {step === 'capture' && <div className="animate-shutter"><div className="rounded-[1.75rem] border-2 border-foreground/10 bg-foreground p-3 shadow-[8px_9px_0_hsl(var(--foreground)/.12)]"><div className="flex items-center justify-between px-3 py-2 text-[10px] font-mono-ui uppercase tracking-[.16em] text-background/60"><span>larapel / live</span><span>{photos.length} of 4</span></div><div className="grid min-h-[300px] gap-2 rounded-[1.1rem] bg-background/10 p-3 sm:min-h-[410px] sm:grid-cols-2">{photos.length ? photos.map((photo, index) => <div key={`${photo}-${index}`} className="group relative overflow-hidden rounded-lg bg-background/10"><img src={photo} alt={`your photo ${index + 1}`} className={`h-full min-h-[138px] w-full object-cover ${filter === 'mono' ? 'grayscale' : 'sepia'}`} data-testid={`img-capture-${index}`} /><button onClick={() => removePhoto(index)} className="absolute right-2 top-2 rounded-full bg-foreground/80 p-2 text-background opacity-0 transition-opacity group-hover:opacity-100" data-testid={`button-remove-photo-${index}`}><Trash2 size={13} /></button></div>) : <div className="col-span-2 flex min-h-[280px] flex-col items-center justify-center rounded-xl border border-dashed border-background/30 text-background/70"><span className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground"><Camera size={25} /></span><span className="text-sm font-bold">start with a real moment</span><div className="mt-4 flex flex-wrap justify-center gap-2"><button onClick={openCamera} className="rounded-full bg-primary px-4 py-2 text-xs font-bold text-primary-foreground" data-testid="button-open-camera">use camera</button><button onClick={() => fileRef.current?.click()} className="rounded-full border border-background/30 px-4 py-2 text-xs font-bold text-background" data-testid="button-choose-photo">choose a photo</button></div></div>}</div><div className="flex items-center justify-between px-2 py-3"><span className="text-[10px] font-mono-ui uppercase tracking-[.14em] text-background/50">ordinary is good</span><button onClick={openCamera} disabled={photos.length >= 4} className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform hover:scale-105 disabled:opacity-40" data-testid="button-add-photo"><ImagePlus size={19} /></button></div></div><input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={onFileChange} className="hidden" data-testid="input-photo" /><div className="mt-5 flex items-center justify-between"><span className="text-xs text-muted-foreground">{photos.length ? `${photos.length} photo${photos.length === 1 ? '' : 's'} captured` : cameraError || 'start with one frame'}</span><PrimaryButton onClick={goNext} disabled={!photos.length} testId="button-next-style">next <ChevronRight size={17} /></PrimaryButton></div>{cameraOpen && <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/80 p-5"><div className="w-full max-w-md rounded-[1.5rem] bg-card p-3 shadow-2xl"><div className="relative overflow-hidden rounded-[1rem] bg-foreground"><video ref={videoRef} muted playsInline className="aspect-[3/4] w-full object-cover" aria-label="live camera preview" /><div className="absolute inset-x-0 bottom-0 flex items-center justify-between p-4"><button onClick={stopCamera} className="rounded-full bg-background/90 px-4 py-2 text-xs font-bold text-foreground" data-testid="button-close-camera">cancel</button><button onClick={captureFromCamera} className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-background bg-primary text-primary-foreground" data-testid="button-capture-photo"><Camera size={24} /></button><span className="w-14 text-right text-[10px] font-mono-ui text-background/70">{photos.length}/4</span></div></div><p className="px-2 pb-1 pt-3 text-center text-xs text-muted-foreground">hold still, then tap the shutter</p></div></div>}</div>}
        {step === 'style' && <div className="grid gap-9 animate-rise sm:grid-cols-[.8fr_1.2fr] sm:items-start"><div className="flex justify-center"><StripPreview photos={photos} note={note} placement={placement} filter={filter} /></div><div className="space-y-7"><fieldset><legend className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[.15em]"><Palette size={15} className="text-primary" /> ink</legend><div className="grid grid-cols-2 gap-2"><button onClick={() => setFilter('mono')} className={`rounded-xl border p-3 text-left transition-all ${filter === 'mono' ? 'border-foreground bg-foreground text-background' : 'border-border bg-card'}`} data-testid="button-filter-mono"><span className="mb-4 block h-8 rounded-lg bg-gradient-to-r from-gray-700 to-gray-300" /><span className="text-xs font-bold">soft mono</span></button><button onClick={() => setFilter('sepia')} className={`rounded-xl border p-3 text-left transition-all ${filter === 'sepia' ? 'border-foreground bg-foreground text-background' : 'border-border bg-card'}`} data-testid="button-filter-sepia"><span className="mb-4 block h-8 rounded-lg bg-gradient-to-r from-[#704b37] to-[#e7c29e]" /><span className="text-xs font-bold">warm sepia</span></button></div></fieldset><fieldset><legend className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[.15em]"><FlipHorizontal2 size={15} className="text-primary" /> note side</legend><div className="flex gap-2"><button onClick={() => setPlacement('front')} className={`flex-1 rounded-xl border px-3 py-3 text-left text-xs font-bold transition-all ${placement === 'front' ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-card'}`} data-testid="button-placement-front">under the photos</button><button onClick={() => setPlacement('back')} className={`flex-1 rounded-xl border px-3 py-3 text-left text-xs font-bold transition-all ${placement === 'back' ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-card'}`} data-testid="button-placement-back">on the back</button></div></fieldset><div className="flex justify-between"><button onClick={() => setStep('capture')} className="flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-foreground" data-testid="button-back-capture"><ChevronLeft size={16} /> retake</button><PrimaryButton onClick={goNext} testId="button-next-note">add a note <ChevronRight size={17} /></PrimaryButton></div></div></div>}
        {step === 'note' && <div className="grid gap-9 animate-rise sm:grid-cols-[.8fr_1.2fr] sm:items-start"><div className="flex justify-center"><StripPreview photos={photos} note={note} placement={placement} filter={filter} /></div><div><label htmlFor="note" className="mb-3 block text-xs font-bold uppercase tracking-[.15em]">write something they’ll keep</label><textarea id="note" value={note} onChange={(event) => setNote(event.target.value.slice(0, 180))} placeholder="for the group chat, future you, or no one in particular..." className="min-h-[155px] w-full resize-none rounded-2xl border border-border bg-card p-4 font-display text-xl leading-tight outline-none transition-shadow placeholder:text-muted-foreground/60 focus:border-primary focus:ring-4 focus:ring-primary/10" data-testid="input-note" /><div className="mt-2 flex justify-between text-xs text-muted-foreground"><span>optional, but it makes the strip yours</span><span>{note.length}/180</span></div><div className="mt-8 flex items-center justify-between"><button onClick={() => setStep('style')} className="flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-foreground" data-testid="button-back-style"><ChevronLeft size={16} /> change style</button><PrimaryButton onClick={save} disabled={createStrip.isPending} testId="button-save-strip">{createStrip.isPending ? <><Loader2 size={16} className="animate-spin" /> developing</> : <><Check size={16} /> save the strip</>}</PrimaryButton></div></div></div>}
      </div>
    </div></div>{toast && <ToastMessage onClose={() => setToast('')}>{toast}</ToastMessage>}</AppShell>;
}