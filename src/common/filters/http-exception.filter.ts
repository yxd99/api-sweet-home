import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: unknown = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      if (typeof res === 'string') {
        message = res;
      } else {
        const resObj = res as Record<string, unknown>;
        message = resObj.message || res;
      }
    } else if (exception instanceof Error) {
      this.logger.error(
        `Unhandled exception ${request.method} ${request.url}`,
        exception.stack,
      );
    } else {
      this.logger.error(`Unhandled exception ${request.method} ${request.url}`);
    }

    response.status(status).json({
      statusCode: status,
      path: request.url,
      message,
    });
  }
}
