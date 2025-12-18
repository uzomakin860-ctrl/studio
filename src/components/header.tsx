import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sun, Moon } from 'lucide-react';

export function Header() {
  return (
    <header className="p-4 flex justify-between items-center border-b">
      <Link href="/">
        <h1 className="text-2xl font-headline font-bold text-primary">EchoCanvas</h1>
      </Link>
      <Button variant="ghost" size="icon" aria-label="Toggle theme" disabled>
        <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        <span className="sr-only">Toggle theme</span>
      </Button>
    </header>
  );
}
