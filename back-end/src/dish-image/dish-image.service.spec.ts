import { Test, TestingModule } from '@nestjs/testing';
import { DishImageService } from './dish-image.service';

describe('DishImageService', () => {
  let service: DishImageService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DishImageService],
    }).compile();

    service = module.get<DishImageService>(DishImageService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
