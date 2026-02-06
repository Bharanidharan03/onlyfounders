import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const standards = await prisma.standard.findMany();
    console.log('Standards:', standards);
}

main()
    .catch((e) => console.error(e))
    .finally(() => prisma.$disconnect());
