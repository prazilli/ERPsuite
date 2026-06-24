const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const userId = 2n; // assuming 2n is the user Pratiksha

  const leaves = await prisma.leaveRequest.findMany({
    where: { user_id: userId },
    orderBy: { start_date: 'desc' },
  });

  const leaveIds = leaves.map(l => l.leave_id);

  const approvals = await prisma.approval.findMany({
    where: {
      module: 'LEAVE_REQUEST',
      record_id: { in: leaveIds },
    },
  });

  const res = leaves.map(leave => {
    const approval = approvals.find(a => BigInt(a.record_id) === BigInt(leave.leave_id));
    return {
      ...leave,
      manager_comments: approval?.comments || null,
    };
  });
  
  console.log(res);
}

main().catch(console.error).finally(() => prisma.$disconnect());
