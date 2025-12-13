import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Internal server error';
    let error = 'Internal Server Error';

    // HttpException 처리
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else {
        const errorObj = exceptionResponse as any;
        message = errorObj.message || exception.message;
        error = errorObj.error || error;
      }
    }
    // Prisma 에러 처리
    else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      const prismaError = this.handlePrismaError(exception);
      status = prismaError.status;
      message = prismaError.message;
      error = prismaError.error;
    }
    // Prisma Validation 에러
    else if (exception instanceof Prisma.PrismaClientValidationError) {
      status = HttpStatus.BAD_REQUEST;
      message = 'Invalid data provided';
      error = 'Bad Request';
    }
    // 기타 에러
    else if (exception instanceof Error) {
      message = exception.message;
    }

    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message,
      error,
    };

    // 500 에러는 상세 로깅
    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(
        `${request.method} ${request.url}`,
        exception instanceof Error ? exception.stack : JSON.stringify(exception),
      );
    } else {
      this.logger.warn(
        `${request.method} ${request.url} - ${status}`,
        message,
      );
    }

    response.status(status).json(errorResponse);
  }

  private handlePrismaError(exception: Prisma.PrismaClientKnownRequestError): {
    status: number;
    message: string;
    error: string;
  } {
    switch (exception.code) {
      case 'P2002':
        // Unique constraint violation
        const target = (exception.meta?.target as string[]) || [];
        return {
          status: HttpStatus.CONFLICT,
          message: `A record with this ${target.join(', ')} already exists`,
          error: 'Conflict',
        };

      case 'P2025':
        // Record not found
        return {
          status: HttpStatus.NOT_FOUND,
          message: 'Record not found',
          error: 'Not Found',
        };

      case 'P2003':
        // Foreign key constraint failed
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Invalid reference to related record',
          error: 'Bad Request',
        };

      case 'P2014':
        // Required relation violation
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'The change you are trying to make would violate a required relation',
          error: 'Bad Request',
        };

      case 'P2021':
        // Table does not exist
        return {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Database table does not exist',
          error: 'Internal Server Error',
        };

      case 'P2022':
        // Column does not exist
        return {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Database column does not exist',
          error: 'Internal Server Error',
        };

      default:
        return {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Database error occurred',
          error: 'Internal Server Error',
        };
    }
  }
}
