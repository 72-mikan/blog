'use server'

import { signOut } from '@/auth';

export async function customSignOut() {
  await signOut();
}