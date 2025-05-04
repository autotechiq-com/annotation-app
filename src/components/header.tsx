import { GalleryVerticalEnd } from 'lucide-react';
import { LanguageToggle } from './lang-toggle';
import { Container } from './ui/container';
import { User } from './user';

export function Header() {
  return (
    <div className="fixed h-16 top-0 z-50 w-full border-b border-border bg-background">
      <Container className="flex h-full items-center justify-between gap-4">
        <a href="#" className="flex items-center gap-2 self-center font-medium">
          <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
            <GalleryVerticalEnd className="size-4" />
          </div>
          Annotation App.
        </a>
        <div className="flex gap-4">
          <User />
          <LanguageToggle />
        </div>
      </Container>
    </div>
  );
}
