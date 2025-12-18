
import { ArrowLeft, Inbox } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function InboxPage() {
  return (
    <div className="container mx-auto max-w-2xl p-4">
      <header className="relative flex items-center justify-center mb-8">
        <Link href="/" passHref className="absolute left-0">
          <Button variant="ghost" size="icon">
            <ArrowLeft />
          </Button>
        </Link>
        <h1 className="text-xl font-bold">Inbox</h1>
      </header>
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
        <Inbox className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-xl font-medium">No messages yet</h3>
        <p className="text-sm text-muted-foreground">
          Your conversations with other users will appear here.
        </p>
      </div>
    </div>
  );
}
