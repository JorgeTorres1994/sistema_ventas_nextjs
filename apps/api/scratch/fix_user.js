const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const user = await prisma.user.update({
      where: { email: 'tonyblakes1000@gmail.com' },
      data: { authProvider: 'GOOGLE' }
    });
    console.log('Usuario actualizado con éxito:', user.email, '->', user.authProvider);
  } catch (error) {
    console.error('Error al actualizar:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
