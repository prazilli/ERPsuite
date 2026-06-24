import { PrismaService } from '../prisma/prisma.service';
export declare class AssetsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getAssets(companyId: bigint, currentUser: any): Promise<({
        assignments: ({
            user: {
                role_id: bigint;
                user_id: bigint;
                email: string;
                company_id: bigint;
                department_id: bigint | null;
                first_name: string | null;
                last_name: string | null;
                password_hash: string;
                phone: string | null;
                is_active: boolean;
                email_verified: boolean;
                created_at: Date;
            };
        } & {
            user_id: bigint;
            asset_id: bigint;
            assignment_id: bigint;
            assigned_at: Date;
            returned_at: Date | null;
        })[];
    } & {
        name: string;
        company_id: bigint;
        created_at: Date;
        asset_id: bigint;
        serial_number: string;
        condition: string;
    })[]>;
    createAsset(companyId: bigint, data: any, currentUser: any): Promise<{
        name: string;
        company_id: bigint;
        created_at: Date;
        asset_id: bigint;
        serial_number: string;
        condition: string;
    }>;
    assignAsset(assetId: bigint, data: any, currentUser: any): Promise<{
        user_id: bigint;
        asset_id: bigint;
        assignment_id: bigint;
        assigned_at: Date;
        returned_at: Date | null;
    }>;
    returnAsset(assetId: bigint, currentUser: any): Promise<{
        name: string;
        company_id: bigint;
        created_at: Date;
        asset_id: bigint;
        serial_number: string;
        condition: string;
    }>;
    updateCondition(assetId: bigint, condition: string, currentUser: any): Promise<{
        name: string;
        company_id: bigint;
        created_at: Date;
        asset_id: bigint;
        serial_number: string;
        condition: string;
    }>;
    getAssetAnalytics(companyId: bigint, currentUser: any): Promise<{
        totalAssets: number;
        assignedAssets: number;
        availableAssets: number;
        assetsUnderRepair: number;
        retiredAssets: number;
        utilizationPercentage: number;
    }>;
    private verifyTenant;
}
