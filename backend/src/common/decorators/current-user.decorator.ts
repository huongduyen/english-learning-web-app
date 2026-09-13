import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const DEFAULT_LEARNER_USER_ID = 'cb9c0c5b-9aaa-4501-84f4-9a617c7feef3';

export const CurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    // 1. If passport/auth guard populated user on request
    if (user) {
      return data ? user?.[data] : user.id || user;
    }

    // 2. If client supplied explicit x-user-id header
    const headerUserId = request.headers['x-user-id'];
    if (headerUserId && typeof headerUserId === 'string') {
      return headerUserId;
    }

    // 3. Fallback to seeded learner user for development / public API exploration
    return DEFAULT_LEARNER_USER_ID;
  },
);
