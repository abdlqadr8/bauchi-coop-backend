import { Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
declare const JwtStrategy_base: new (...args: [opt: import("passport-jwt").StrategyOptionsWithRequest] | [opt: import("passport-jwt").StrategyOptionsWithoutRequest]) => Strategy & {
    validate(...args: any[]): unknown;
};
/**
 * JWT Strategy for Passport
 * Extracts JWT from Authorization header and validates it
 */
export declare class JwtStrategy extends JwtStrategy_base {
    constructor(configService: ConfigService);
    /**
     * Validates JWT payload and returns user info
     * Called by Passport after JWT verification succeeds
     */
    validate(payload: {
        sub: string;
        email: string;
        role: string;
    }): {
        userId: string;
        email: string;
        role: string;
    };
}
export {};
//# sourceMappingURL=jwt.strategy.d.ts.map