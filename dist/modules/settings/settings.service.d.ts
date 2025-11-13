import { PrismaService } from "@/prisma/prisma.service";
/**
 * Settings Service
 * Manages system settings
 */
export declare class SettingsService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    /**
     * Get all settings
     */
    getAll(): Promise<Array<{
        id: string;
        key: string;
        value: string;
    }>>;
    /**
     * Get setting by key
     */
    getByKey(key: string): Promise<{
        id: string;
        key: string;
        value: string;
    } | null>;
    /**
     * Update or create setting
     */
    upsert(key: string, value: string): Promise<{
        id: string;
        key: string;
        value: string;
    }>;
}
//# sourceMappingURL=settings.service.d.ts.map