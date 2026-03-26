import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { slugify } from '@/lib/utils';

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.redirect(new URL('/login', request.url));

  const formData = await request.formData();
  const title = String(formData.get('title') || '').trim();
  const description = String(formData.get('description') || '').trim();
  const bannerUrl = String(formData.get('bannerUrl') || '').trim() || '/uploads/demo-banner.svg';
  const coverUrl = String(formData.get('coverUrl') || '').trim() || '/uploads/demo-cover.svg';
  const visibility = String(formData.get('visibility') || 'PRIVATE') as 'PRIVATE' | 'UNLISTED' | 'PUBLIC';

  if (!title || !description) return NextResponse.redirect(new URL('/dashboard', request.url));

  const baseSlug = slugify(title);
  let slug = baseSlug;
  let count = 1;
  while (await prisma.universe.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${count++}`;
  }

  await prisma.universe.create({
    data: {
      title,
      slug,
      description,
      bannerUrl,
      coverUrl,
      visibility,
      ownerId: user.id,
    },
  });

  return NextResponse.redirect(new URL('/dashboard', request.url));
}
