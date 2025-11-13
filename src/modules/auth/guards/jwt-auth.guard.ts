import { Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

/**
 * JWT Auth Guard - protects routes that require JWT authentication
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {}
