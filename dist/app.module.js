"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const Joi = __importStar(require("joi"));
const prisma_module_1 = require("./prisma/prisma.module");
const auth_module_1 = require("./modules/auth/auth.module");
const users_module_1 = require("./modules/users/users.module");
const applications_module_1 = require("./modules/applications/applications.module");
const payments_module_1 = require("./modules/payments/payments.module");
const certificates_module_1 = require("./modules/certificates/certificates.module");
const settings_module_1 = require("./modules/settings/settings.module");
const dashboard_module_1 = require("./modules/dashboard/dashboard.module");
const reports_module_1 = require("./modules/reports/reports.module");
const uploads_module_1 = require("./modules/uploads/uploads.module");
/**
 * Root application module.
 * Configures global modules and loads all feature modules.
 */
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            // Load environment variables globally
            config_1.ConfigModule.forRoot({
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
                }),
            }),
            // Global database module
            prisma_module_1.PrismaModule,
            // Feature modules
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            applications_module_1.ApplicationsModule,
            payments_module_1.PaymentsModule,
            certificates_module_1.CertificatesModule,
            settings_module_1.SettingsModule,
            dashboard_module_1.DashboardModule,
            reports_module_1.ReportsModule,
            uploads_module_1.UploadsModule,
        ],
        controllers: [],
        providers: [],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map