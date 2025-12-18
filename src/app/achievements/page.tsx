
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function AchievementsPage() {
  return (
    <div className="container mx-auto max-w-2xl p-4">
      <header className="relative flex items-center justify-center mb-8">
        <Link href="/" passHref className="absolute left-0">
          <Button variant="ghost" size="icon">
            <ArrowLeft />
          </Button>
        </Link>
        <h1 className="text-xl font-bold">Achievements</h1>
      </header>
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
        <h3 className="text-xl font-medium">Achievements Unlocked</h3>
        <p className="text-sm text-muted-foreground">
          You have unlocked 2 achievements. More coming soon!
        </p>
      </div>
    </div>
  );
}
