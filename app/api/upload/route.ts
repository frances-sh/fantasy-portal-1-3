import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { saveUploadedFile } from '@/lib/storage';

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.redirect(new URL('/login', request.url));

  const formData = await request.formData();
  const file = formData.get('file');
  if (!(file instanceof File)) return NextResponse.redirect(new URL('/dashboard', request.url));

  await saveUploadedFile(file);
  return NextResponse.redirect(new URL('/dashboard', request.url));
}
