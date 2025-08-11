import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const FilterObject = createParamDecorator(
  (data: any, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const dto = request.body;

    for (let key in dto) {
      if (dto[key] === '' || dto[key] === undefined || dto[key] === null) {
        delete dto[key];
      }

      if (dto[key] === 'true') {
        dto[key] = true;
      }
      if (dto[key] === 'false') {
        dto[key] = false;
      }
    }

    return dto;
  },
);
