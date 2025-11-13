import { SettingsService } from "./settings.service";
/**
 * Settings Controller
 */
export declare class SettingsController {
    private readonly settingsService;
    constructor(settingsService: SettingsService);
    /**
     * GET /admin/settings
     * Get all settings
     */
    getAll(): Promise<Array<{
        id: string;
        key: string;
        value: string;
    }>>;
    /**
     * GET /admin/settings/:key
     * Get setting by key
     */
    getByKey(key: string): Promise<{
        id: string;
        key: string;
        value: string;
    } | null>;
    /**
     * PATCH /admin/settings
     * Update or create setting
     */
    upsert({ key, value }: {
        key: string;
        value: string;
    }): Promise<{
        id: string;
        key: string;
        value: string;
    }>;
}
//# sourceMappingURL=settings.controller.d.ts.map