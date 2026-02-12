import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Response } from 'express';
import { map, Observable } from 'rxjs';
import dayjs from 'dayjs';

/**
 * 递归格式化日期
 * 将 Date 对象转换为 'YYYY-MM-DD HH:mm:ss' 格式
 */
function formatDates(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  if (obj instanceof Date) {
    return dayjs(obj).format('YYYY-MM-DD HH:mm:ss');
  }
  if (Array.isArray(obj)) {
    return obj.map(formatDates);
  }
  if (typeof obj === 'object') {
    const result: any = {};
    for (const key in obj) {
      result[key] = formatDates(obj[key]);
    }
    return result;
  }
  return obj;
}

@Injectable()
export class FormatResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const response = context.switchToHttp().getResponse<Response>();

    return next.handle().pipe(
      map((data) => {
        return {
          code: response.statusCode,
          data: formatDates(data),
          message: 'success',
        };
      }),
    );
  }
}
