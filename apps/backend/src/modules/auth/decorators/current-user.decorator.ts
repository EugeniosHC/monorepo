import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { ClerkUser } from 'src/modules/auth/types/auth.types';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): ClerkUser => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
