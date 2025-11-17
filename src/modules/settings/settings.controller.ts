import { Controller, Get, Patch, Query, Body, UseGuards } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

/**
 * Settings Controller
 */
@Controller('api/v1/admin/settings')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SYSTEM_ADMIN')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  /**
   * GET /admin/settings
   * Get all settings
   */
  @Get()
  async getAll(): Promise<
    Array<{
      id: string;
      key: string;
      value: string;
    }>
  > {
    return this.settingsService.getAll();
  }

  /**
   * GET /admin/settings/:key
   * Get setting by key
   */
  @Get(':key')
  async getByKey(
    @Query('key') key: string,
  ): Promise<{ id: string; key: string; value: string } | null> {
    return this.settingsService.getByKey(key);
  }

  /**
   * PATCH /admin/settings
   * Update or create setting
   */
  @Patch()
  async upsert(
    @Body() { key, value }: { key: string; value: string },
  ): Promise<{ id: string; key: string; value: string }> {
    return this.settingsService.upsert(key, value);
  }
}
