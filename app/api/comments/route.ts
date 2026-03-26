import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.redirect(new URL('/login', request.url));

  const formData = await request.formData();
  const universeId = String(formData.get('universeId') || '');
  const content = String(formData.get('content') || '').trim();
  const returnTo = String(formData.get('returnTo') || '/dashboard');

  if (!universeId || !content) return NextResponse.redirect(new URL(returnTo, request.url));

  await prisma.comment.create({
    data: { universeId, authorId: user.id, content },
  });

  return NextResponse.redirect(new URL(returnTo, request.url));
}
