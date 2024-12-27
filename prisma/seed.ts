import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  // Update all bounties that have null expiryMinutes
  await prisma.bounty.updateMany({
    where: {
      expiryMinutes: null
    },
    data: {
      expiryMinutes: 30
    }
  });
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  }) 