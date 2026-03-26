import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { canEditUniverse } from '@/lib/permissions';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const character = await prisma.character.findUnique({ where: { id } });
  if (!character) return NextResponse.redirect(new URL('/dashboard', request.url));

  const access = await canEditUniverse(character.universeId);
  if (!access.allowed) return NextResponse.redirect(new URL('/dashboard', request.url));

  const formData = await request.formData();
  const action = String(formData.get('action') || 'update');
  const returnTo = String(formData.get('returnTo') || '/dashboard');

  if (action === 'delete') {
    await prisma.character.delete({ where: { id } });
    return NextResponse.redirect(new URL(returnTo, request.url));
  }

  await prisma.character.update({
    where: { id },
    data: {
      name: String(formData.get('name') || character.name).trim() || character.name,
      summary: String(formData.get('summary') || character.summary).trim() || character.summary,
      tags: String(formData.get('tags') || character.tags).trim() || character.tags,
      imageUrl: String(formData.get('imageUrl') || character.imageUrl || '').trim() || '/uploads/default-avatar.svg',
    },
  });

  return NextResponse.redirect(new URL(returnTo, request.url));
}
