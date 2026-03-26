import { NextResponse } from 'next/server';
import { canEditUniverse } from '@/lib/permissions';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  const formData = await request.formData();
  const universeId = String(formData.get('universeId') || '');
  const centuryLabel = String(formData.get('centuryLabel') || '').trim();
  const title = String(formData.get('title') || '').trim();
  const content = String(formData.get('content') || '').trim();
  const orderIndex = Number(formData.get('orderIndex') || 0);
  const returnTo = String(formData.get('returnTo') || '/dashboard');

  const access = await canEditUniverse(universeId);
  if (!access.allowed) return NextResponse.redirect(new URL('/dashboard', request.url));
  if (!centuryLabel || !title || !content) return NextResponse.redirect(new URL(returnTo, request.url));

  await prisma.timelineEntry.create({
    data: { universeId, centuryLabel, title, content, orderIndex: Number.isFinite(orderIndex) ? orderIndex : 0 },
  });

  return NextResponse.redirect(new URL(returnTo, request.url));
}
