"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('Seeding extended ERP suite data...');
    console.log('Wiping database...');
    await prisma.auditLog.deleteMany({});
    await prisma.notification.deleteMany({});
    await prisma.approval.deleteMany({});
    await prisma.announcement.deleteMany({});
    await prisma.meeting.deleteMany({});
    await prisma.jobPosting.deleteMany({});
    await prisma.assetAssignment.deleteMany({});
    await prisma.asset.deleteMany({});
    await prisma.vendorBill.deleteMany({});
    await prisma.vendor.deleteMany({});
    await prisma.payment.deleteMany({});
    await prisma.invoice.deleteMany({});
    await prisma.expense.deleteMany({});
    await prisma.projectDocument.deleteMany({});
    await prisma.timesheet.deleteMany({});
    await prisma.task.deleteMany({});
    await prisma.projectMilestone.deleteMany({});
    await prisma.projectAssignment.deleteMany({});
    await prisma.project.deleteMany({});
    await prisma.client.deleteMany({});
    await prisma.lead.deleteMany({});
    await prisma.payroll.deleteMany({});
    await prisma.salaryStructure.deleteMany({});
    await prisma.leaveBalance.deleteMany({});
    await prisma.leaveRequest.deleteMany({});
    await prisma.attendance.deleteMany({});
    await prisma.employeeProfile.deleteMany({});
    await prisma.holiday.deleteMany({});
    await prisma.refreshToken.deleteMany({});
    await prisma.emailVerification.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.rolePermission.deleteMany({});
    await prisma.permission.deleteMany({});
    await prisma.departmentFeature.deleteMany({});
    await prisma.department.deleteMany({});
    await prisma.company.deleteMany({});
    await prisma.role.deleteMany({});
    console.log('Seeding Roles...');
    const roles = [
        { role_id: 1n, role_name: 'Company Head / CEO', description: 'Company Head or CEO with full access to company operations.' },
        { role_id: 2n, role_name: 'Department Head', description: 'Department Head with access to manage department operations.' },
        { role_id: 3n, role_name: 'Employee', description: 'Standard employee with access to department-level widgets.' },
    ];
    for (const role of roles) {
        await prisma.role.create({ data: role });
    }
    console.log('Seeding Permissions...');
    const permissions = [
        { permission_id: 1n, permission_name: 'manage_departments' },
        { permission_id: 2n, permission_name: 'approve_requests' },
        { permission_id: 3n, permission_name: 'create_employees' },
        { permission_id: 4n, permission_name: 'assign_supervisors' },
        { permission_id: 5n, permission_name: 'view_analytics' },
        { permission_id: 6n, permission_name: 'view_audit_logs' },
        { permission_id: 7n, permission_name: 'manage_features' },
    ];
    for (const perm of permissions) {
        await prisma.permission.create({ data: perm });
    }
    console.log('Mapping Permissions...');
    for (let i = 1; i <= 7; i++) {
        await prisma.rolePermission.create({ data: { role_id: 1n, permission_id: BigInt(i) } });
    }
    const deptHeadPerms = [1, 3, 4, 5, 6, 7];
    for (const pId of deptHeadPerms) {
        await prisma.rolePermission.create({ data: { role_id: 2n, permission_id: BigInt(pId) } });
    }
    await prisma.rolePermission.create({ data: { role_id: 3n, permission_id: 5n } });
    console.log('Database schema metadata (roles/permissions) seeded successfully!');
}
main()
    .catch((e) => {
    console.error('Seeding failed with error:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map