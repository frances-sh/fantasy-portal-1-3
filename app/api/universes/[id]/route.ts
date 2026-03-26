import { NextResponse } from 'next/server';
import { canEditUniverse } from '@/lib/permissions';
import { prisma } from '@/lib/prisma';
import { slugify } from '@/lib/utils';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const access = await canEditUniverse(id);
  if (!access.allowed || !access.universe) return NextResponse.redirect(new URL('/dashboard', request.url));

  const formData = await request.formData();
  const action = String(formData.get('action') || 'update');

  if (action === 'delete') {
    await prisma.universe.delete({ where: { id } });
    return NextResponse.redirect(new URL('/dashboard?deleted=1', request.url));
  }

  const title = String(formData.get('title') || '').trim();
  const description = String(formData.get('description') || '').trim();
  const bannerUrl = String(formData.get('bannerUrl') || '').trim() || '/uploads/demo-banner.svg';
  const coverUrl = String(formData.get('coverUrl') || '').trim() || '/uploads/demo-cover.svg';
  const visibility = String(formData.get('visibility') || 'PRIVATE') as 'PRIVATE' | 'UNLISTED' | 'PUBLIC';
  const ownerId = String(formData.get('ownerId') || access.universe.ownerId);

  let slug = access.universe.slug;
  if (title && title !== access.universe.title) {
    const baseSlug = slugify(title);
    slug = baseSlug;
    let count = 1;
    while (await prisma.universe.findFirst({ where: { slug, NOT: { id } } })) {
      slug = `${baseSlug}-${count++}`;
    }
  }

  await prisma.universe.update({
    where: { id },
    data: {
      title: title || access.universe.title,
      slug,
      description: description || access.universe.description,
      bannerUrl,
      coverUrl,
      visibility,
      ownerId: access.user?.role === 'ADMIN' ? ownerId : access.universe.ownerId,
    },
  });

  return NextResponse.redirect(new URL(`/universes/${slug}?updated=1`, request.url));
}
