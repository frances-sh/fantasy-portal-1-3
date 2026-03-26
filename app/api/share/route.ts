import { randomUUID } from 'node:crypto';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.redirect(new URL('/login', request.url));

  const formData = await request.formData();
  const universeId = String(formData.get('universeId') || '');
  const universe = await prisma.universe.findUnique({ where: { id: universeId } });

  if (!universe || universe.ownerId !== user.id) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  await prisma.shareLink.create({
    data: {
      universeId,
      token: randomUUID().slice(0, 12),
      allowComment: true,
      allowDownload: true,
      createdById: user.id,
    },
  });

  return NextResponse.redirect(new URL('/dashboard', request.url));
}
