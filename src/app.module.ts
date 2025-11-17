import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ApplicationsModule } from './modules/applications/applications.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { CertificatesModule } from './modules/certificates/certificates.module';
import { SettingsModule } from './modules/settings/settings.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { ReportsModule } from './modules/reports/reports.module';
import { UploadsModule } from './modules/uploads/uploads.module';
import { EmailModule } from './modules/email/email.module';
import { FilesModule } from './modules/files/files.module';

/**
 * Root application module.
 * Configures global modules and loads all feature modules.
 */
@Module({
  imports: [
    // Load environment variables globally
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validationSchema: Joi.object({
        DATABASE_URL: Joi.string().required(),
        JWT_SECRET: Joi.string().required(),
        JWT_EXPIRES_IN: Joi.string().default('15m'),
        JWT_REFRESH_EXPIRES_IN: Joi.string().default('7d'),
        PORT: Joi.number().default(3000),
        NODE_ENV: Joi.string()
          .valid('development', 'production', 'test')
          .default('development'),
        // Payment Gateway Configuration
        PAYSTACK_PUBLIC_KEY: Joi.string().optional(),
        PAYSTACK_SECRET_KEY: Joi.string().optional(),
        // Email Configuration
        MAILJET_API_KEY: Joi.string().optional(),
        MAILJET_API_SECRET: Joi.string().optional(),
        SENDER_EMAIL: Joi.string().default('noreply@bauchicooperative.ng'),
        SENDER_NAME: Joi.string().default('Bauchi Cooperative Registry'),
        ADMIN_EMAIL: Joi.string().default('admin@bauchicooperative.ng'),
        // File Storage Configuration
        CLOUDINARY_CLOUD_NAME: Joi.string().optional(),
        CLOUDINARY_API_KEY: Joi.string().optional(),
        CLOUDINARY_API_SECRET: Joi.string().optional(),
        CLOUDINARY_UPLOAD_PRESET: Joi.string().optional(),
        // Frontend Configuration
        FRONTEND_URL: Joi.string().default('http://localhost:5173'),
      }),
    }),
    // Global database module
    PrismaModule,
    // Global service modules
    EmailModule,
    FilesModule,
    // Feature modules
    AuthModule,
    UsersModule,
    ApplicationsModule,
    PaymentsModule,
    CertificatesModule,
    SettingsModule,
    DashboardModule,
    ReportsModule,
    UploadsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
