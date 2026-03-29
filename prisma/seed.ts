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
      accentColor: '#63d7ff',
      bio: 'Administrador do portal, moderador dos chats e curador dos mundos públicos.',
      bannerUrl: '/uploads/demo-banner.svg',
      avatarUrl: '/uploads/default-avatar.svg',
    },
    create: {
      name: 'Ceifador',
      email: adminEmail,
      passwordHash: hash,
      role: 'ADMIN',
      accentColor: '#63d7ff',
      bio: 'Administrador do portal, moderador dos chats e curador dos mundos públicos.',
      bannerUrl: '/uploads/demo-banner.svg',
      avatarUrl: '/uploads/default-avatar.svg',
    },
  });

  const guestHash = await bcrypt.hash('12345678', 10);
  const guest = await prisma.user.upsert({
    where: { email: 'autor-demo@portal.com' },
    update: {
      passwordHash: guestHash,
      accentColor: '#a56bff',
      bio: 'Autora de mundos fantásticos, curiosidades estranhas e teorias longas no chat geral.',
      bannerUrl: '/uploads/demo-banner.svg',
      avatarUrl: '/uploads/default-avatar.svg',
    },
    create: {
      name: 'Lira',
      email: 'autor-demo@portal.com',
      passwordHash: guestHash,
      accentColor: '#a56bff',
      bio: 'Autora de mundos fantásticos, curiosidades estranhas e teorias longas no chat geral.',
      bannerUrl: '/uploads/demo-banner.svg',
      avatarUrl: '/uploads/default-avatar.svg',
    },
  });

  const title = 'Universo Original';
  const slug = slugify(title);

  const universe = await prisma.universe.upsert({
    where: { slug },
    update: {
      description: 'Um mundo em expansão com criaturas antigas, reinos em ruínas, curiosidades mutáveis e uma cronologia moldada por pactos, guerras e lendas.',
      bannerUrl: '/uploads/demo-banner.svg',
      coverUrl: '/uploads/demo-cover.svg',
      visibility: 'PUBLIC',
      ownerId: admin.id,
    },
    create: {
      slug,
      title,
      description: 'Um mundo em expansão com criaturas antigas, reinos em ruínas, curiosidades mutáveis e uma cronologia moldada por pactos, guerras e lendas.',
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

  await prisma.loreEntry.upsert({
    where: { id: 'demo-lore-001' },
    update: {
      universeId: universe.id,
      category: 'Curiosidade',
      title: 'As luas trocam de cor antes das marés mágicas',
      content: 'Quando a mana do continente sobe, as luas gêmeas assumem tons âmbar e violeta, alterando a magia de sangue e as viagens marítimas.',
      orderIndex: 1,
    },
    create: {
      id: 'demo-lore-001',
      universeId: universe.id,
      category: 'Curiosidade',
      title: 'As luas trocam de cor antes das marés mágicas',
      content: 'Quando a mana do continente sobe, as luas gêmeas assumem tons âmbar e violeta, alterando a magia de sangue e as viagens marítimas.',
      orderIndex: 1,
    },
  });

  await prisma.comment.upsert({
    where: { id: 'demo-comment-001' },
    update: {
      universeId: universe.id,
      authorId: admin.id,
      content: 'Registro antigo do universo, mantido apenas por compatibilidade da base.',
    },
    create: {
      id: 'demo-comment-001',
      universeId: universe.id,
      authorId: admin.id,
      content: 'Registro antigo do universo, mantido apenas por compatibilidade da base.',
    },
  });

  await prisma.globalMessage.upsert({
    where: { id: 'demo-global-001' },
    update: {
      authorId: admin.id,
      content: 'Bem-vindos ao chat geral. Agora as conversas não ficam presas a um mundo só.',
    },
    create: {
      id: 'demo-global-001',
      authorId: admin.id,
      content: 'Bem-vindos ao chat geral. Agora as conversas não ficam presas a um mundo só.',
    },
  });

  await prisma.globalMessage.upsert({
    where: { id: 'demo-global-002' },
    update: {
      authorId: guest.id,
      content: 'Se quiserem trocar ideia sobre construção de mundo, me chamem no perfil ou no privado.',
    },
    create: {
      id: 'demo-global-002',
      authorId: guest.id,
      content: 'Se quiserem trocar ideia sobre construção de mundo, me chamem no perfil ou no privado.',
    },
  });

  await prisma.privateMessage.upsert({
    where: { id: 'demo-private-001' },
    update: {
      senderId: admin.id,
      recipientId: guest.id,
      content: 'Mensagem privada de demonstração para mostrar a nova área reservada.',
    },
    create: {
      id: 'demo-private-001',
      senderId: admin.id,
      recipientId: guest.id,
      content: 'Mensagem privada de demonstração para mostrar a nova área reservada.',
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
