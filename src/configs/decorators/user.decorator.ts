import { createParamDecorator } from '@nestjs/common';
import { ExecutionContextHost } from '@nestjs/core/helpers/execution-context-host';
const jwt = require('jsonwebtoken');

export const GetUser = createParamDecorator(
  async (_, ctx: ExecutionContextHost) => {
    const request = ctx.switchToHttp().getRequest();
    const token = request.headers['authorization'];

    if (!token || !token.startsWith('Bearer ')) {
      return null;
    }

    const jwtToken = token.replace('Bearer ', '');
    const payload = jwt.verify(jwtToken, process.env.JWT_SECRET);
    return payload.id;
  },
);
