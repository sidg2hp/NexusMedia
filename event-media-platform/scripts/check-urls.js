const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

prisma.media.findMany({
  take: 5,
  orderBy: { createdAt: 'desc' }
}).then(media => {
  console.log("Found URLs:");
  media.forEach(m => console.log(m.url));
}).finally(() => {
  prisma.$disconnect();
});
