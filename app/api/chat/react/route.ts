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

  const existing = await prisma.globalMessageReaction.findUnique({
    where: {
      messageId_userId_emoji: {
        messageId,
        userId: user.id,
        emoji,
      },
    },
  });

  if (existing) {
    await prisma.globalMessageReaction.delete({ where: { id: existing.id } });
  } else {
    await prisma.globalMessageReaction.create({
      data: {
        messageId,
        userId: user.id,
        emoji,
      },
    });
  }

  return NextResponse.redirect(new URL(returnTo, request.url));
}
