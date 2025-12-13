import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    const exceptionResponse = exception.getResponse();
    const error =
      typeof exceptionResponse === 'string'
        ? { message: exceptionResponse }
        : (exceptionResponse as any);

    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message: error.message || exception.message,
      error: error.error || HttpStatus[status],
    };

    // ValidationPipe 에러 처리 (배열 형태의 메시지)
    if (Array.isArray(error.message)) {
      errorResponse.message = error.message;
    }

    // 500 에러는 로깅
    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(
        `${request.method} ${request.url}`,
        JSON.stringify(errorResponse),
        exception.stack,
      );
    } else {
      this.logger.warn(
        `${request.method} ${request.url} - ${status}`,
        JSON.stringify(error.message),
      );
    }

    response.status(status).json(errorResponse);
  }
}
