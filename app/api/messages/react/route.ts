import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const ALLOWED = new Set(['👍', '🔥', '✨', '🖤']);

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.redirect(new URL('/login', request.url));

  const formData = await request.formData();
  const messageId = String(formData.get('messageId') || '').trim();
  const emoji = String(formData.get('emoji') || '').trim();
  const returnTo = String(formData.get('returnTo') || '/chat');

  if (!messageId || !ALLOWED.has(emoji)) {
    return NextResponse.redirect(new URL(returnTo, request.url));
  }

  const message = await prisma.privateMessage.findUnique({
    where: { id: messageId },
    select: { senderId: true, recipientId: true },
  });

  if (!message || (message.senderId !== user.id && message.recipientId !== user.id)) {
    return NextResponse.redirect(new URL('/chat', request.url));
  }

  const existing = await prisma.privateMessageReaction.findUnique({
    where: {
      messageId_userId_emoji: {
        messageId,
        userId: user.id,
        emoji,
      },
    },
  });

  if (existing) {
    await prisma.privateMessageReaction.delete({ where: { id: existing.id } });
  } else {
    await prisma.privateMessageReaction.create({
      data: {
        messageId,
        userId: user.id,
        emoji,
      },
    });
  }

  return NextResponse.redirect(new URL(returnTo, request.url));
}
