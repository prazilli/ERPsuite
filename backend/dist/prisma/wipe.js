"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('Initiating database wipe...');
    try {
        await prisma.auditLog.deleteMany({});
        console.log('✔ AuditLogs cleared.');
        await prisma.notification.deleteMany({});
        console.log('✔ Notifications cleared.');
        await prisma.approval.deleteMany({});
        console.log('✔ Approvals cleared.');
        await prisma.assetAssignment.deleteMany({});
        console.log('✔ AssetAssignments cleared.');
        await prisma.asset.deleteMany({});
        console.log('✔ Assets cleared.');
        await prisma.vendorBill.deleteMany({});
        console.log('✔ VendorBills cleared.');
        await prisma.vendor.deleteMany({});
        console.log('✔ Vendors cleared.');
        await prisma.payment.deleteMany({});
        console.log('✔ Payments cleared.');
        await prisma.invoice.deleteMany({});
        console.log('✔ Invoices cleared.');
        await prisma.expense.deleteMany({});
        console.log('✔ Expenses cleared.');
        await prisma.projectDocument.deleteMany({});
        console.log('✔ ProjectDocuments cleared.');
        await prisma.timesheet.deleteMany({});
        console.log('✔ Timesheets cleared.');
        await prisma.task.deleteMany({});
        console.log('✔ Tasks cleared.');
        await prisma.projectMilestone.deleteMany({});
        console.log('✔ ProjectMilestones cleared.');
        await prisma.projectAssignment.deleteMany({});
        console.log('✔ ProjectAssignments cleared.');
        await prisma.project.deleteMany({});
        console.log('✔ Projects cleared.');
        await prisma.client.deleteMany({});
        console.log('✔ Clients cleared.');
        await prisma.lead.deleteMany({});
        console.log('✔ Leads cleared.');
        await prisma.payroll.deleteMany({});
        console.log('✔ Payroll records cleared.');
        await prisma.salaryStructure.deleteMany({});
        console.log('✔ SalaryStructures cleared.');
        await prisma.leaveBalance.deleteMany({});
        console.log('✔ LeaveBalances cleared.');
        await prisma.leaveRequest.deleteMany({});
        console.log('✔ LeaveRequests cleared.');
        await prisma.attendance.deleteMany({});
        console.log('✔ Attendance registers cleared.');
        await prisma.employeeProfile.deleteMany({});
        console.log('✔ EmployeeProfiles cleared.');
        await prisma.holiday.deleteMany({});
        console.log('✔ Holidays cleared.');
        await prisma.refreshToken.deleteMany({});
        console.log('✔ RefreshTokens cleared.');
        await prisma.emailVerification.deleteMany({});
        console.log('✔ EmailVerifications cleared.');
        await prisma.user.deleteMany({});
        console.log('✔ Users cleared.');
        await prisma.rolePermission.deleteMany({});
        console.log('✔ RolePermissions cleared.');
        await prisma.permission.deleteMany({});
        console.log('✔ Permissions cleared.');
        await prisma.departmentFeature.deleteMany({});
        console.log('✔ DepartmentFeatures cleared.');
        await prisma.department.deleteMany({});
        console.log('✔ Departments cleared.');
        await prisma.company.deleteMany({});
        console.log('✔ Companies cleared.');
        await prisma.role.deleteMany({});
        console.log('✔ Roles cleared.');
        console.log('\n🌟 DATABASE WIPE COMPLETED SUCCESSFULLY! 🌟');
        console.log('\nRestoring system roles and permissions...');
        const roles = [
            { role_id: 1n, role_name: 'Company Head / CEO', description: 'Company Head or CEO with full access to company operations.' },
            { role_id: 2n, role_name: 'Department Head', description: 'Department Head with access to manage department operations.' },
            { role_id: 3n, role_name: 'Employee', description: 'Standard employee with access to department-level widgets.' },
        ];
        for (const role of roles) {
            await prisma.role.create({ data: role });
        }
        console.log('✔ System roles seeded.');
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
        console.log('✔ System permissions seeded.');
        for (let i = 1; i <= 7; i++) {
            await prisma.rolePermission.create({ data: { role_id: 1n, permission_id: BigInt(i) } });
        }
        const deptHeadPerms = [1, 3, 4, 5, 6, 7];
        for (const pId of deptHeadPerms) {
            await prisma.rolePermission.create({ data: { role_id: 2n, permission_id: BigInt(pId) } });
        }
        await prisma.rolePermission.create({ data: { role_id: 3n, permission_id: 5n } });
        console.log('✔ Role permission mappings seeded.');
        console.log('🌟 ROLES AND PERMISSIONS SYSTEM RESTORED AFTER WIPE! 🌟');
    }
    catch (e) {
        console.error('❌ Database wipe failed:', e.message || e);
        process.exit(1);
    }
    finally {
        await prisma.$disconnect();
    }
}
main();
//# sourceMappingURL=wipe.js.map