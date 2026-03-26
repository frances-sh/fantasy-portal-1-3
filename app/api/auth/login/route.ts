import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { createSessionCookie } from '@/lib/auth';

export async function POST(request: Request) {
  const formData = await request.formData();
  const email = String(formData.get('email') || '').trim().toLowerCase();
  const password = String(formData.get('password') || '');

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return NextResponse.redirect(new URL('/login', request.url));

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return NextResponse.redirect(new URL('/login', request.url));

  await createSessionCookie({
    userId: user.id,
    role: user.role,
    email: user.email,
    name: user.name,
  });

  return NextResponse.redirect(new URL('/dashboard', request.url));
}
