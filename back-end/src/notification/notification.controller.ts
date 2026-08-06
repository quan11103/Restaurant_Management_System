import { Controller, Sse, MessageEvent, Post, Body } from '@nestjs/common';
import { Observable, map } from 'rxjs';
import { NotificationService } from './notification.service';

@Controller('api')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) { }

  // Endpoint mở kết nối SSE tới Frontend
  @Sse('stream')
  sse(): Observable<MessageEvent> {
    return this.notificationService.getEventStream().pipe(
      map((data) => ({
        data: data, // NestJS sẽ tự động JSON.stringify đối tượng 'data' này
      }) as MessageEvent),
    );
  }
}