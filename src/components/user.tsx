'use client';

import { LogOut, User2 } from 'lucide-react';

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { authClient } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { useDictionary } from './dictionary-provider';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

export function User() {
  const router = useRouter();
  const t = useDictionary();

  const { data: session } = authClient.useSession();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="flex items-center gap-2">
          <Avatar>
            <AvatarImage src={session?.user.image ?? ''} />
            <AvatarFallback>
              <User2 className="size-4" />
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-sm font-medium">{session?.user.name}</span>
            <span className="text-xs opacity-50">{session?.user.email}</span>
          </div>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-fit">
        <DropdownMenuItem
          onClick={async () => {
            await authClient.signOut({
              fetchOptions: {
                onSuccess: () => {
                  router.push('/login');
                },
              },
            });
          }}
        >
          <LogOut />
          <span>{t.Global.logout}</span>
          {/* <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut> */}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
