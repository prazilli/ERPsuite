const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const leaves = await prisma.leaveRequest.findMany();
  const leaveIds = leaves.map(l => l.leave_id);
  const approvals = await prisma.approval.findMany({
    where: { module: 'LEAVE_REQUEST', record_id: { in: leaveIds } }
  });
  console.log('Leaves:', leaves.map(l => ({ id: l.leave_id.toString(), reason: l.reason, status: l.status })));
  console.log('Approvals:', approvals.map(a => ({ id: a.approval_id.toString(), record_id: a.record_id.toString(), comments: a.comments })));
}

main().catch(console.error).finally(() => prisma.$disconnect());
