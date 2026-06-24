import { AssetsService } from './assets.service';
export declare class AssetsController {
    private readonly assetsService;
    constructor(assetsService: AssetsService);
    getAssets(user: any): Promise<({
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
    createAsset(body: any, user: any): Promise<{
        name: string;
        company_id: bigint;
        created_at: Date;
        asset_id: bigint;
        serial_number: string;
        condition: string;
    }>;
    assignAsset(assetId: string, body: any, user: any): Promise<{
        user_id: bigint;
        asset_id: bigint;
        assignment_id: bigint;
        assigned_at: Date;
        returned_at: Date | null;
    }>;
    returnAsset(assetId: string, user: any): Promise<{
        name: string;
        company_id: bigint;
        created_at: Date;
        asset_id: bigint;
        serial_number: string;
        condition: string;
    }>;
    updateCondition(assetId: string, condition: string, user: any): Promise<{
        name: string;
        company_id: bigint;
        created_at: Date;
        asset_id: bigint;
        serial_number: string;
        condition: string;
    }>;
    getAssetAnalytics(user: any): Promise<{
        totalAssets: number;
        assignedAssets: number;
        availableAssets: number;
        assetsUnderRepair: number;
        retiredAssets: number;
        utilizationPercentage: number;
    }>;
}
