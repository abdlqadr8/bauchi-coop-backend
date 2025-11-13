import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "@/prisma/prisma.service";

/**
 * Settings Service
 * Manages system settings
 */
@Injectable()
export class SettingsService {
  private readonly logger = new Logger("SettingsService");

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get all settings
   */
  async getAll(): Promise<
    Array<{
      id: string;
      key: string;
      value: string;
    }>
  > {
    return this.prisma.setting.findMany();
  }

  /**
   * Get setting by key
   */
  async getByKey(key: string): Promise<{
    id: string;
    key: string;
    value: string;
  } | null> {
    return this.prisma.setting.findUnique({ where: { key } });
  }

  /**
   * Update or create setting
   */
  async upsert(
    key: string,
    value: string
  ): Promise<{ id: string; key: string; value: string }> {
    return this.prisma.setting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
  }
}
