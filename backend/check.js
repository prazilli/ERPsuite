const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({ include: { role: true } });
  console.log(users.map(u => ({ id: u.user_id, name: u.first_name, role: u.role.role_name })));
}

main().catch(console.error).finally(() => prisma.$disconnect());
