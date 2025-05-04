import { cookies } from 'next/headers';
import 'server-only';

type ILang = 'en' | 'ru';

const dictionaries = {
  en: () => import('@/languages/en.json').then((module) => module.default),
  ru: () => import('@/languages/ru.json').then((module) => module.default),
};

export const getLangCookie = async (): Promise<ILang | undefined> => {
  const cookieStore = await cookies();
  const langCookie = cookieStore.get('NEXT_LOCALE');
  if (!langCookie) return undefined;
  return langCookie?.value as ILang;
};
export const getDictionary = async (locale: ILang) => dictionaries[locale]();
