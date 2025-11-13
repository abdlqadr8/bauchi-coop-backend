"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadsController = void 0;
const common_1 = require("@nestjs/common");
const uploads_service_1 = require("./uploads.service");
const presign_url_dto_1 = require("./dto/presign-url.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
/**
 * Uploads Controller
 * Handles presigned URLs and document metadata
 */
let UploadsController = class UploadsController {
    constructor(uploadsService) {
        this.uploadsService = uploadsService;
    }
    /**
     * POST /uploads/presign
     * Generate presigned URL for file upload
     */
    async generatePresignedUrl(presignUrlDto, applicationId) {
        return this.uploadsService.generatePresignedUrl(presignUrlDto, applicationId);
    }
    /**
     * POST /uploads/documents/metadata
     * Store document metadata after upload (requires auth)
     */
    async storeDocumentMetadata({ applicationId, filename, fileUrl, documentType, }, req) {
        return this.uploadsService.storeDocumentMetadata(applicationId, filename, fileUrl, documentType);
    }
};
exports.UploadsController = UploadsController;
__decorate([
    (0, common_1.Post)('presign'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Query)('applicationId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [presign_url_dto_1.PresignUrlDto, String]),
    __metadata("design:returntype", Promise)
], UploadsController.prototype, "generatePresignedUrl", null);
__decorate([
    (0, common_1.Post)('documents/metadata'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UploadsController.prototype, "storeDocumentMetadata", null);
exports.UploadsController = UploadsController = __decorate([
    (0, common_1.Controller)('uploads'),
    __metadata("design:paramtypes", [uploads_service_1.UploadsService])
], UploadsController);
//# sourceMappingURL=uploads.controller.js.map