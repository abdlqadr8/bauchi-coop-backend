import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { ProfileController } from './profile.controller';
import { UsersService } from './users.service';
import { PrismaModule } from '@/prisma/prisma.module';
import { ActivityLogsModule } from '../activity-logs/activity-logs.module';
import { EmailModule } from '../email/email.module';

/**
 * Users Module
 * Provides user management functionality
 */
@Module({
  imports: [PrismaModule, ActivityLogsModule, EmailModule],
  controllers: [UsersController, ProfileController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
