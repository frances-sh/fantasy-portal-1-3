import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { isHexColor } from '@/lib/utils';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const formData = await request.formData();
  const role = String(formData.get('role') || 'USER') as 'USER' | 'ADMIN';
  const accentColorInput = String(formData.get('accentColor') || '').trim();

  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing) return NextResponse.redirect(new URL('/admin', request.url));

  await prisma.user.update({
    where: { id },
    data: {
      name: String(formData.get('name') || existing.name).trim() || existing.name,
      email: String(formData.get('email') || existing.email).trim() || existing.email,
      bio: String(formData.get('bio') || existing.bio).trim(),
      avatarUrl: String(formData.get('avatarUrl') || '').trim() || null,
      bannerUrl: String(formData.get('bannerUrl') || '').trim() || null,
      accentColor: isHexColor(accentColorInput) ? accentColorInput : existing.accentColor,
      role,
    },
  });

  return NextResponse.redirect(new URL(`/admin/users/${id}?updated=1`, request.url));
}
