import { Test, TestingModule } from '@nestjs/testing';
import { GoodsBillService } from './goods-bill.service';

describe('GoodsBillService', () => {
  let service: GoodsBillService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GoodsBillService],
    }).compile();

    service = module.get<GoodsBillService>(GoodsBillService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
