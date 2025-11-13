import { Module } from "@nestjs/common";
import { PrismaService } from "./prisma.service";

/**
 * Global module that provides PrismaService for database access.
 */
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
