import { OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";
/**
 * PrismaService wrapper for PrismaClient.
 * Handles connection lifecycle and provides type-safe database access.
 */
export declare class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    private readonly logger;
    onModuleInit(): Promise<void>;
    onModuleDestroy(): Promise<void>;
}
//# sourceMappingURL=prisma.service.d.ts.map