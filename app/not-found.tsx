import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center bg-ivory">
      <div className="text-center px-4">
        <p className="font-serif-display text-6xl text-burgundy font-semibold mb-4">
          404
        </p>
        <h1 className="font-serif-display text-2xl text-brown mb-3">
          Piece Not Found
        </h1>
        <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
          We could not find the piece you are looking for. It may have been
          moved or is no longer available.
        </p>
        <Link href="/">
          <Button className="bg-burgundy hover:bg-burgundy-dark text-ivory font-medium tracking-wide rounded-sm px-8">
            Back to Home
          </Button>
        </Link>
      </div>
    </div>
  );
}
