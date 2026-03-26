import { prisma } from '../lib/prisma';
import bcrypt from 'bcryptjs';
import { slugify } from '../lib/utils';

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@portal.com';
  const adminPassword = process.env.ADMIN_PASSWORD || '12345678';
  const hash = await bcrypt.hash(adminPassword, 10);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      passwordHash: hash,
      role: 'ADMIN',
      accentColor: '#e9b86d',
      bio: 'Administrador do portal e curador dos universos públicos.',
      bannerUrl: '/uploads/demo-banner.svg',
      avatarUrl: '/uploads/default-avatar.svg',
    },
    create: {
      name: 'Ceifador',
      email: adminEmail,
      passwordHash: hash,
      role: 'ADMIN',
      accentColor: '#e9b86d',
      bio: 'Administrador do portal e curador dos universos públicos.',
      bannerUrl: '/uploads/demo-banner.svg',
      avatarUrl: '/uploads/default-avatar.svg',
    },
  });

  const title = 'Universo Original';
  const slug = slugify(title);

  const universe = await prisma.universe.upsert({
    where: { slug },
    update: {
      description: 'Um mundo em expansão com criaturas antigas, reinos em ruínas e uma cronologia moldada por pactos, guerras e lendas.',
      bannerUrl: '/uploads/demo-banner.svg',
      coverUrl: '/uploads/demo-cover.svg',
      visibility: 'PUBLIC',
      ownerId: admin.id,
    },
    create: {
      slug,
      title,
      description: 'Um mundo em expansão com criaturas antigas, reinos em ruínas e uma cronologia moldada por pactos, guerras e lendas.',
      bannerUrl: '/uploads/demo-banner.svg',
      coverUrl: '/uploads/demo-cover.svg',
      visibility: 'PUBLIC',
      ownerId: admin.id,
    },
  });

  await prisma.character.upsert({
    where: { id: 'demo-character-001' },
    update: {
      universeId: universe.id,
      name: 'Aerin do Vale Rubro',
      summary: 'Guardião de fronteira, conhecido por sobreviver ao eclipse de cinzas e retornar com memórias fragmentadas.',
      tags: 'guardião, eclipse, fronteira',
      imageUrl: '/uploads/default-avatar.svg',
    },
    create: {
      id: 'demo-character-001',
      universeId: universe.id,
      name: 'Aerin do Vale Rubro',
      summary: 'Guardião de fronteira, conhecido por sobreviver ao eclipse de cinzas e retornar com memórias fragmentadas.',
      tags: 'guardião, eclipse, fronteira',
      imageUrl: '/uploads/default-avatar.svg',
    },
  });

  await prisma.timelineEntry.upsert({
    where: { id: 'demo-timeline-001' },
    update: {
      universeId: universe.id,
      centuryLabel: 'Século I',
      title: 'A Fundação das Primeiras Casas',
      content: 'Os quatro clãs fundadores dividiram o continente e ergueram santuários sobre ruínas muito mais antigas.',
      orderIndex: 1,
    },
    create: {
      id: 'demo-timeline-001',
      universeId: universe.id,
      centuryLabel: 'Século I',
      title: 'A Fundação das Primeiras Casas',
      content: 'Os quatro clãs fundadores dividiram o continente e ergueram santuários sobre ruínas muito mais antigas.',
      orderIndex: 1,
    },
  });

  await prisma.shareLink.upsert({
    where: { token: 'demo-public-link' },
    update: {
      universeId: universe.id,
      allowComment: true,
      allowDownload: true,
      createdById: admin.id,
    },
    create: {
      universeId: universe.id,
      token: 'demo-public-link',
      allowComment: true,
      allowDownload: true,
      createdById: admin.id,
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
