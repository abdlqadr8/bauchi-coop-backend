import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Get IP address from request
 */
export const IpAddress = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string | undefined => {
    const request = ctx.switchToHttp().getRequest();

    // Check for IP in various headers (for proxied requests)
    const ip =
      request.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
      request.headers['x-real-ip'] ||
      request.connection?.remoteAddress ||
      request.socket?.remoteAddress ||
      request.ip;

    return ip;
  },
);
