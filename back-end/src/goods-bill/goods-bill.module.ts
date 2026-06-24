import { Module } from '@nestjs/common';
import { GoodsBillService } from './goods-bill.service';
import { GoodsBillController } from './goods-bill.controller';

@Module({
  controllers: [GoodsBillController],
  providers: [GoodsBillService],
})
export class GoodsBillModule {}
