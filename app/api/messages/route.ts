import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.redirect(new URL('/login', request.url));

  const formData = await request.formData();
  const recipientId = String(formData.get('recipientId') || '').trim();
  const content = String(formData.get('content') || '').trim();
  const returnTo = String(formData.get('returnTo') || '/chat');

  if (!recipientId || !content || recipientId === user.id) {
    return NextResponse.redirect(new URL(returnTo, request.url));
  }

  const recipient = await prisma.user.findUnique({ where: { id: recipientId }, select: { id: true } });
  if (!recipient) return NextResponse.redirect(new URL('/chat', request.url));

  await prisma.privateMessage.create({
    data: {
      senderId: user.id,
      recipientId,
      content,
    },
  });

  return NextResponse.redirect(new URL(returnTo, request.url));
}
