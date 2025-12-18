
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function EditAvatarPage() {
  return (
    <div className="container mx-auto max-w-2xl p-4">
      <header className="relative flex items-center justify-center mb-8">
        <Link href="/" passHref className="absolute left-0">
          <Button variant="ghost" size="icon">
            <ArrowLeft />
          </Button>
        </Link>
        <h1 className="text-xl font-bold">Edit Avatar</h1>
      </header>
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
        <h3 className="text-xl font-medium">Coming Soon</h3>
        <p className="text-sm text-muted-foreground">
          You'll be able to edit your avatar here.
        </p>
      </div>
    </div>
  );
}
