const { prisma } = require('../prismaClient');
async function main() {
  try {
    const u = await prisma.user.findFirst({ where: { email: 'admin@sirius.com', role: 'ADMIN' } });
    console.log('user', u);
  } catch (e) {
    console.error('prisma error', e);
  } finally {
    process.exit(0);
  }
}
main();
