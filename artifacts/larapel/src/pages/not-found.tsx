import { Link } from 'wouter';
import { AppShell } from '@/components/larapel';

export default function NotFound() {
  return <AppShell><div className="flex min-h-[65vh] flex-col items-center justify-center px-5 text-center"><p className="font-mono-ui text-xs uppercase tracking-[.2em] text-primary">404 / off the strip</p><h1 className="mt-4 font-display text-7xl leading-none">wrong booth.</h1><p className="mt-4 text-sm text-muted-foreground">That little page isn’t here.</p><Link href="/" className="mt-7 rounded-full bg-foreground px-5 py-3 text-sm font-bold text-background" data-testid="link-not-found-home">back to the booth</Link></div></AppShell>;
}
