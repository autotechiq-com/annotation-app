import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import Image from 'next/image';

export function ImagePreview({ src }: { src: string }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Image src={src} alt="" width={450} height={450} className="relative w-full object-contain rounded-md" />
      </DialogTrigger>

      <DialogContent>
        <DialogTitle>Image</DialogTitle>
        <DialogContent className="sm:max-w-[96vw] !w-[96vw] !h-[96vh]">
          <Image src={src} alt="" layout="fill" className="relative h-full w-full object-contain rounded-md" />
        </DialogContent>
      </DialogContent>
    </Dialog>
  );
}
