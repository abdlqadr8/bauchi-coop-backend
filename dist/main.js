"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const configService = app.get(config_1.ConfigService);
    // Enable global validation pipe with class-validator
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
            enableImplicitConversion: true,
        },
    }));
    const port = configService.get("PORT", 3000);
    await app.listen(port);
    console.log(`✓ Application running on http://localhost:${port}`);
}
bootstrap().catch((err) => {
    console.error("Failed to start application:", err);
    process.exit(1);
});
//# sourceMappingURL=main.js.map