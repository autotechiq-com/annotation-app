'use server';
import { cookies } from 'next/headers';

export default async function setCookie(name: string, value: string) {
  const cookieStore = await cookies();
  cookieStore.set(name, value);
}
