import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const Pagination = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();

    const page = parseInt(request.query.page);
    const pageSize = 10;

    const paginationData = {
      page,
      limit: pageSize,
      offset: (page - 1) * pageSize,
    };

    return paginationData;
  },
);
