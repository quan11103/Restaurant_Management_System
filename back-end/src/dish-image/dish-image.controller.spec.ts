import { Test, TestingModule } from '@nestjs/testing';
import { DishImageController } from './dish-image.controller';
import { DishImageService } from './dish-image.service';

describe('DishImageController', () => {
  let controller: DishImageController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DishImageController],
      providers: [DishImageService],
    }).compile();

    controller = module.get<DishImageController>(DishImageController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
