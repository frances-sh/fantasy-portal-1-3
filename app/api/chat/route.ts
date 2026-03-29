import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.redirect(new URL('/login', request.url));

  const formData = await request.formData();
  const content = String(formData.get('content') || '').trim();
  const returnTo = String(formData.get('returnTo') || '/chat');

  if (!content) return NextResponse.redirect(new URL(returnTo, request.url));

  await prisma.globalMessage.create({
    data: {
      authorId: user.id,
      content,
    },
  });

  return NextResponse.redirect(new URL(returnTo, request.url));
}
