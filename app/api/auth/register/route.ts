import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { createSessionCookie } from '@/lib/auth';

export async function POST(request: Request) {
  const formData = await request.formData();
  const name = String(formData.get('name') || '').trim();
  const email = String(formData.get('email') || '').trim().toLowerCase();
  const password = String(formData.get('password') || '');

  if (!name || !email || password.length < 6) {
    return NextResponse.redirect(new URL('/register', request.url));
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return NextResponse.redirect(new URL('/login', request.url));

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { name, email, passwordHash },
  });

  await createSessionCookie({
    userId: user.id,
    role: user.role,
    email: user.email,
    name: user.name,
  });

  return NextResponse.redirect(new URL('/dashboard', request.url));
}
