import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixDNI() {
  console.log('Iniciando corrección de DNIs en la base de datos...');
  const customers = await prisma.customer.findMany();
  
  for (const customer of customers) {
    if (!customer.dni) continue;
    
    // Si el DNI tiene el formato incorrecto (ej: 10.003.882-M)
    // 1. Quitamos los puntos y guiones
    // 2. Quitamos cualquier letra al final
    // 3. Tomamos exactamente 8 dígitos (rellenando con 0 si faltan)
    
    let cleanDNI = customer.dni.replace(/[\.\-a-zA-Z]/g, '').trim();
    
    // Asegurarse de que tenga exactamente 8 dígitos (rellenar o cortar)
    if (cleanDNI.length > 8) {
        cleanDNI = cleanDNI.substring(0, 8);
    } else if (cleanDNI.length < 8) {
        cleanDNI = cleanDNI.padStart(8, '0');
    }
    
    if (cleanDNI !== customer.dni) {
        await prisma.customer.update({
            where: { id: customer.id },
            data: { dni: cleanDNI }
        });
        console.log(`Corregido: ${customer.name} -> ${customer.dni} ahora es ${cleanDNI}`);
    }
  }
  
  console.log('✅ Corrección de DNIs finalizada.');
  await prisma.$disconnect();
}

fixDNI().catch(e => {
  console.error(e);
  prisma.$disconnect();
  process.exit(1);
});
