import { Test, TestingModule } from '@nestjs/testing';
import { GoodsBillController } from './goods-bill.controller';
import { GoodsBillService } from './goods-bill.service';

describe('GoodsBillController', () => {
  let controller: GoodsBillController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GoodsBillController],
      providers: [GoodsBillService],
    }).compile();

    controller = module.get<GoodsBillController>(GoodsBillController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
