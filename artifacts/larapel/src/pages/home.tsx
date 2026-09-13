import { Link } from 'wouter';
import { AppShell, EmptyStripArt, PrimaryButton } from '@/components/larapel';

export default function Home() {
  return <AppShell><section className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14"><div className="border-b border-border pb-9"><h1 className="text-[clamp(4rem,16vw,9rem)] font-bold leading-[.75] tracking-[-.1em]">larapel</h1><p className="mt-5 text-sm font-medium text-secondary">a photo. a few words. that's it.</p><Link href="/create" className="mt-7 inline-flex" data-testid="link-start-capture"><PrimaryButton>make one</PrimaryButton></Link></div><div className="grid grid-cols-2 gap-2 pt-6 sm:grid-cols-4" aria-label="Larapel examples">{[0, 1, 2, 3].map((item) => <div key={item} className={`${item % 2 ? 'mt-7' : ''} max-w-[230px]`}><EmptyStripArt /></div>)}</div></section></AppShell>;
}
