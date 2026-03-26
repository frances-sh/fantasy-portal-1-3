import { prisma } from './prisma';
import { getCurrentUser } from './auth';

export async function canEditUniverse(universeId: string) {
  const user = await getCurrentUser();
  if (!user) return { allowed: false as const, user: null, universe: null };
  const universe = await prisma.universe.findUnique({ where: { id: universeId } });
  if (!universe) return { allowed: false as const, user, universe: null };
  const allowed = user.role === 'ADMIN' || universe.ownerId === user.id;
  return { allowed, user, universe };
}
