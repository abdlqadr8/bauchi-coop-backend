import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from "@nestjs/common";
import { PrismaClient } from "@prisma/client";

/**
 * PrismaService wrapper for PrismaClient.
 * Handles connection lifecycle and provides type-safe database access.
 */
@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger("PrismaService");

  async onModuleInit(): Promise<void> {
    try {
      await this.$connect();
      this.logger.log("✓ Database connected successfully");
    } catch (error) {
      this.logger.error("Failed to connect to database:", error);
      throw error;
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
    this.logger.log("✓ Database disconnected");
  }
}
