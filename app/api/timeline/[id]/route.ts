import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { canEditUniverse } from '@/lib/permissions';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const entry = await prisma.timelineEntry.findUnique({ where: { id } });
  if (!entry) return NextResponse.redirect(new URL('/dashboard', request.url));
  const access = await canEditUniverse(entry.universeId);
  if (!access.allowed) return NextResponse.redirect(new URL('/dashboard', request.url));

  const formData = await request.formData();
  const action = String(formData.get('action') || 'update');
  const returnTo = String(formData.get('returnTo') || '/dashboard');

  if (action === 'delete') {
    await prisma.timelineEntry.delete({ where: { id } });
    return NextResponse.redirect(new URL(returnTo, request.url));
  }

  await prisma.timelineEntry.update({
    where: { id },
    data: {
      centuryLabel: String(formData.get('centuryLabel') || entry.centuryLabel).trim() || entry.centuryLabel,
      title: String(formData.get('title') || entry.title).trim() || entry.title,
      content: String(formData.get('content') || entry.content).trim() || entry.content,
      orderIndex: Number(formData.get('orderIndex') || entry.orderIndex),
    },
  });

  return NextResponse.redirect(new URL(returnTo, request.url));
}
