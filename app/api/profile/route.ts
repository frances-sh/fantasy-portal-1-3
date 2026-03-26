import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { isHexColor } from '@/lib/utils';

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.redirect(new URL('/login', request.url));

  const formData = await request.formData();
  const name = String(formData.get('name') || '').trim();
  const bio = String(formData.get('bio') || '').trim();
  const avatarUrl = String(formData.get('avatarUrl') || '').trim();
  const bannerUrl = String(formData.get('bannerUrl') || '').trim();
  const accentColorInput = String(formData.get('accentColor') || '').trim();
  const accentColor = isHexColor(accentColorInput) ? accentColorInput : user.accentColor;

  if (!name) return NextResponse.redirect(new URL('/profile?error=name', request.url));

  await prisma.user.update({
    where: { id: user.id },
    data: {
      name,
      bio,
      avatarUrl: avatarUrl || null,
      bannerUrl: bannerUrl || null,
      accentColor,
    },
  });

  return NextResponse.redirect(new URL('/profile?updated=1', request.url));
}
