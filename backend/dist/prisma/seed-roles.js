"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('Restoring system roles and permissions...');
    try {
        const rolesCount = await prisma.role.count();
        if (rolesCount === 0) {
            const roles = [
                { role_id: 1n, role_name: 'Company Head / CEO', description: 'Company Head or CEO with full access to company operations.' },
                { role_id: 2n, role_name: 'Department Head', description: 'Department Head with access to manage department operations.' },
                { role_id: 3n, role_name: 'Employee', description: 'Standard employee with access to department-level widgets.' },
            ];
            for (const role of roles) {
                await prisma.role.create({ data: role });
            }
            console.log('✔ System roles seeded.');
        }
        const permissionsCount = await prisma.permission.count();
        if (permissionsCount === 0) {
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
        }
        const rpCount = await prisma.rolePermission.count();
        if (rpCount === 0) {
            for (let i = 1; i <= 7; i++) {
                await prisma.rolePermission.create({ data: { role_id: 1n, permission_id: BigInt(i) } });
            }
            const deptHeadPerms = [1, 3, 4, 5, 6, 7];
            for (const pId of deptHeadPerms) {
                await prisma.rolePermission.create({ data: { role_id: 2n, permission_id: BigInt(pId) } });
            }
            await prisma.rolePermission.create({ data: { role_id: 3n, permission_id: 5n } });
            console.log('✔ Role permission mappings seeded.');
        }
        console.log('\n🌟 ROLES AND PERMISSIONS SYSTEM READY! 🌟');
    }
    catch (e) {
        console.error('❌ Seeding failed:', e.message || e);
        process.exit(1);
    }
    finally {
        await prisma.$disconnect();
    }
}
main();
//# sourceMappingURL=seed-roles.js.map