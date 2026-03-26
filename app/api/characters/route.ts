import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.redirect(new URL('/login', request.url));

  const formData = await request.formData();
  const universeId = String(formData.get('universeId') || '');
  const name = String(formData.get('name') || '').trim();
  const summary = String(formData.get('summary') || '').trim();
  const tags = String(formData.get('tags') || '').trim();
  const imageUrl = String(formData.get('imageUrl') || '').trim() || '/uploads/default-avatar.svg';

  const universe = await prisma.universe.findUnique({ where: { id: universeId } });
  if (!universe || universe.ownerId !== user.id) return NextResponse.redirect(new URL('/dashboard', request.url));

  await prisma.character.create({
    data: {
      universeId,
      name,
      summary,
      tags,
      imageUrl,
    },
  });

  return NextResponse.redirect(new URL('/dashboard', request.url));
}
