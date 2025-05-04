'use client';

import * as React from 'react';

import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

import Image from 'next/image';
import setCookie from '@/lib/set-cookie';
import { useDictionary } from '@/components/dictionary-provider';

import usIcon from '@/assets/us.svg';
import ruIcon from '@/assets/ru.svg';

export function LanguageToggle() {
  const t = useDictionary();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="flex-shrink-0">
          <Image src={t.Lang === 'en' ? usIcon : ruIcon} alt={t.Lang} width={10} height={5} className="absolute h-[1.05rem] w-[1.05rem]" />
          <span className="sr-only">{t.Global.switch_language}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={async () => await setCookie('NEXT_LOCALE', 'en')} className="flex items-center gap-2">
          <Image src={usIcon} alt="us" width={12} height={7} />
          English, US
        </DropdownMenuItem>
        <DropdownMenuItem onClick={async () => await setCookie('NEXT_LOCALE', 'ru')} className="flex items-center gap-2">
          <Image src={ruIcon} alt="ru" width={12} height={7} />
          Русский
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
