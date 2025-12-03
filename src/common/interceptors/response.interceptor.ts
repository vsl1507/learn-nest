import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((result) => {
        return {
          success: true,
          message: result?.message || 'Request successful',
          data: result?.data ?? result,
          timestamp: new Date().toISOString(),
        };
      }),
    );
  }
}
