import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { Observable, tap } from 'rxjs';

// 记录请求日志：IP、User-Agent、Controller、Method、耗时、响应内容、登录用户等
@Injectable()
export class InvokeRecordInterceptor implements NestInterceptor {
  private readonly logger = new Logger(InvokeRecordInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();

    const { ip, method, path } = request;
    const className = context.getClass().name;
    const handlerName = context.getHandler().name;
    const userId = request.user?.userId;
    const username = request.user?.username;

    // 记录请求开始
    this.logger.debug(
      `[Request] ${method} ${path} | IP: ${ip} | User: ${username || 'Guest'}(${userId || '-'}) | Controller: ${className}.${handlerName}`,
    );

    const startTime = Date.now();

    return next.handle().pipe(
      tap({
        next: (data) => {
          const duration = Date.now() - startTime;
          // 记录请求成功
          this.logger.debug(
            `[Response] ${method} ${path} | Status: ${response.statusCode} | Duration: ${duration}ms`,
          );
          // 只在开发环境记录响应内容（避免生产环境日志过大）
          if (process.env.NODE_ENV !== 'production') {
            this.logger.debug(`[Data] ${JSON.stringify(data)}`);
          }
        },
        error: (error) => {
          const duration = Date.now() - startTime;
          // 记录请求失败
          this.logger.error(
            `[Error] ${method} ${path} | Status: ${response.statusCode} | Duration: ${duration}ms | Error: ${error.message}`,
          );
        },
      }),
    );
  }
}
