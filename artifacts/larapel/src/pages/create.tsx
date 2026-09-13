import { type ChangeEvent, useEffect, useRef, useState } from 'react';
import { Camera, Check, ChevronLeft, ChevronRight, FlipHorizontal2, ImagePlus, Loader2, Palette, Trash2 } from 'lucide-react';
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
      setCameraError('camera unavailable');
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
    reader.onload = () => setPhotos((current) => current.length < 4 ? [...current, String(reader.result)] : current);
    reader.readAsDataURL(file);
  };

  const onFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    Array.from(event.target.files || []).slice(0, 4 - photos.length).forEach(addPhoto);
    event.target.value = '';
  };

  const removePhoto = (index: number) => setPhotos((current) => current.filter((_, photoIndex) => photoIndex !== index));
  const goNext = () => {
    if (step === 'capture' && photos.length) setStep('style');
    else if (step === 'style') setStep('note');
  };
  const save = () => {
    const payload: StripInput = { photos, note: note.trim(), placement, filter };
    createStrip.mutate({
      data: payload,
    }, {
      onSuccess: (strip) => {
        queryClient.invalidateQueries({ queryKey: getListStripsQueryKey() });
        setToast('saved');
        setTimeout(() => setLocation(`/share/${strip.id}`), 420);
      },
      onError: () => setToast('try again'),
    });
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-5xl px-5 pb-16 md:px-8">
        <div className="pt-7"><BackLink href="/" /></div>
        <div className="mt-8 flex items-center gap-2 border-b border-secondary/60 pb-6" aria-label="creation progress">
          <StepPill number="01" label="capture" current={step === 'capture'} />
          <StepPill number="02" label="style" current={step === 'style'} />
          <StepPill number="03" label="note" current={step === 'note'} />
        </div>

        <div className="mx-auto max-w-3xl pt-10 md:pt-14">
          <div className="mb-8 flex items-end justify-between border-b border-secondary/60 pb-5">
            <h1 className="text-4xl font-bold tracking-[-0.06em] md:text-6xl">{step}</h1>
            {step === 'capture' && <span className="text-xs font-medium uppercase tracking-[0.16em] text-secondary">{photos.length}/4</span>}
          </div>

          {step === 'capture' && (
            <div className="animate-shutter">
              <div className="border border-foreground bg-foreground p-2">
                <div className="grid min-h-[360px] gap-1 bg-background p-1 sm:min-h-[480px] sm:grid-cols-2">
                  {photos.length ? photos.map((photo, index) => (
                    <div key={`${photo}-${index}`} className="group relative overflow-hidden border border-foreground/40 bg-muted">
                      <img src={photo} alt={`your photo ${index + 1}`} className={`h-full min-h-[170px] w-full object-cover ${filter === 'mono' ? 'grayscale' : 'sepia'}`} data-testid={`img-capture-${index}`} />
                      <button onClick={() => removePhoto(index)} className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center border border-background bg-foreground text-background sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100" aria-label={`remove photo ${index + 1}`} data-testid={`button-remove-photo-${index}`}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )) : (
                    <div className="col-span-2 flex min-h-[350px] items-center justify-center border border-secondary/60 bg-muted sm:min-h-[470px]">
                      <Camera size={48} strokeWidth={1.2} className="text-secondary" aria-hidden="true" />
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between border-t border-background/25 px-2 pt-2">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-background/65" aria-hidden="true">larapel</span>
                  <div className="flex items-center gap-3">
                    <button onClick={() => fileRef.current?.click()} disabled={photos.length >= 4} className="flex h-9 w-9 items-center justify-center border border-background/50 text-background transition-colors hover:bg-background hover:text-foreground disabled:opacity-40" aria-label="choose photo from library" title="choose photo" data-testid="button-choose-photo">
                      <ImagePlus size={17} />
                    </button>
                    <button onClick={openCamera} disabled={photos.length >= 4} className="flex h-14 w-14 items-center justify-center border-4 border-background bg-secondary text-background transition-colors hover:bg-background hover:text-foreground disabled:opacity-40" aria-label="open camera" title="open camera" data-testid="button-add-photo">
                      <Camera size={22} />
                    </button>
                  </div>
                </div>
              </div>
              <input ref={fileRef} type="file" accept="image/*" capture="environment" multiple onChange={onFileChange} className="hidden" data-testid="input-photo" />
              <div className="mt-5 flex items-center justify-between">
                <span className="text-xs text-secondary">{cameraError}</span>
                <PrimaryButton onClick={goNext} disabled={!photos.length} testId="button-next-style">style <ChevronRight size={16} aria-hidden="true" /></PrimaryButton>
              </div>
              {cameraOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/90 p-4">
                  <div className="w-full max-w-md border border-background bg-foreground p-2">
                    <div className="relative overflow-hidden border border-background/40 bg-foreground">
                      <video ref={videoRef} muted playsInline className="aspect-[3/4] w-full object-cover" aria-label="live camera preview" />
                      <div className="absolute inset-x-0 bottom-0 flex items-center justify-between border-t border-background/40 bg-foreground/80 p-4">
                        <button onClick={stopCamera} className="border border-background px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-background" data-testid="button-close-camera">cancel</button>
                        <button onClick={captureFromCamera} className="flex h-16 w-16 items-center justify-center border-4 border-background bg-secondary text-background" aria-label="capture photo" title="capture photo" data-testid="button-capture-photo">
                          <Camera size={24} />
                        </button>
                        <span className="w-14 text-right text-xs font-semibold text-background/70">{photos.length}/4</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 'style' && (
            <div className="animate-rise">
              <div className="grid gap-10 sm:grid-cols-[220px_1fr] sm:items-start">
                <div className="flex justify-center"><StripPreview photos={photos} note={note} placement={placement} filter={filter} /></div>
                <div>
                  <fieldset>
                    <legend className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-secondary"><Palette size={14} aria-hidden="true" /> filter</legend>
                    <div className="grid grid-cols-2 gap-3">
                      {(['mono', 'sepia'] as const).map((option) => (
                        <button key={option} onClick={() => setFilter(option)} className={`border p-2 text-left transition-colors ${filter === option ? 'border-foreground bg-foreground text-background' : 'border-secondary hover:bg-muted'}`} aria-label={`select ${option} filter`} data-testid={`button-filter-${option}`}>
                          <span className="mb-3 block aspect-[4/3] overflow-hidden border border-secondary/50 bg-muted">
                            {photos[0] && <img src={photos[0]} alt="" className={`h-full w-full object-cover ${option === 'mono' ? 'grayscale' : 'sepia'}`} />}
                          </span>
                          <span className="text-xs font-semibold uppercase tracking-[0.12em]">{option}</span>
                        </button>
                      ))}
                    </div>
                  </fieldset>
                  <div className="mt-10 flex items-center justify-between border-t border-secondary/60 pt-5">
                    <button onClick={() => setStep('capture')} className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-secondary hover:text-foreground" data-testid="button-back-capture">
                      <ChevronLeft size={15} aria-hidden="true" /> back
                    </button>
                    <PrimaryButton onClick={goNext} testId="button-next-note">note <ChevronRight size={16} aria-hidden="true" /></PrimaryButton>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 'note' && (
            <div className="animate-rise">
              <div className="grid gap-10 sm:grid-cols-[220px_1fr] sm:items-start">
                <div className="flex justify-center"><StripPreview photos={photos} note={note} placement={placement} filter={filter} /></div>
                <div>
                  <label htmlFor="note" className="sr-only">add a note</label>
                  <textarea id="note" value={note} onChange={(event) => setNote(event.target.value.slice(0, 180))} placeholder="add a note" className="min-h-[100px] w-full resize-none border-b border-secondary bg-transparent px-0 py-3 text-xl font-medium leading-tight outline-none placeholder:text-secondary/70 focus:border-foreground" data-testid="input-note" />
                  <div className="mt-5 flex items-center gap-2 border-b border-secondary/60 pb-5">
                    <span className="mr-2 text-xs font-semibold uppercase tracking-[0.14em] text-secondary"><FlipHorizontal2 size={14} aria-hidden="true" /></span>
                    <button onClick={() => setPlacement('front')} className={`flex h-9 w-9 items-center justify-center border text-xs font-bold ${placement === 'front' ? 'border-foreground bg-foreground text-background' : 'border-secondary text-secondary'}`} aria-label="place note on front" title="front" data-testid="button-placement-front">F</button>
                    <button onClick={() => setPlacement('back')} className={`flex h-9 w-9 items-center justify-center border text-xs font-bold ${placement === 'back' ? 'border-foreground bg-foreground text-background' : 'border-secondary text-secondary'}`} aria-label="place note on back" title="back" data-testid="button-placement-back">B</button>
                  </div>
                  <div className="mt-8 flex items-center justify-between">
                    <button onClick={() => setStep('style')} className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-secondary hover:text-foreground" data-testid="button-back-style">
                      <ChevronLeft size={15} aria-hidden="true" /> back
                    </button>
                    <PrimaryButton onClick={save} disabled={createStrip.isPending} testId="button-save-strip">
                      {createStrip.isPending ? <><Loader2 size={15} className="animate-spin" aria-hidden="true" /> saving</> : <><Check size={15} aria-hidden="true" /> save</>}
                    </PrimaryButton>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      {toast && <ToastMessage onClose={() => setToast('')}>{toast}</ToastMessage>}
    </AppShell>
  );
}