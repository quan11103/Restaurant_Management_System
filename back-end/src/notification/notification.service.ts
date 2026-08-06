import { Injectable } from '@nestjs/common';
import { Subject, Observable } from 'rxjs';

@Injectable()
export class NotificationService {
  // Tạo 1 Subject để phát sự kiện
  private readonly eventStream$ = new Subject<any>();

  // Gọi hàm này ở bất kỳ đâu khi Database thay đổi (ví dụ: sau lệnh repo.save())
  notifyDbChange(data: any) {
    this.eventStream$.next(data);
  }

  // Lấy ra Observable để truyền sang Controller
  getEventStream(): Observable<any> {
    return this.eventStream$.asObservable();
  }
}