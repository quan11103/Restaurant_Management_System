import { Test, TestingModule } from '@nestjs/testing';
import { IngredientSupplierController } from './ingredient-supplier.controller';
import { IngredientSupplierService } from './ingredient-supplier.service';

describe('IngredientSupplierController', () => {
  let controller: IngredientSupplierController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [IngredientSupplierController],
      providers: [IngredientSupplierService],
    }).compile();

    controller = module.get<IngredientSupplierController>(IngredientSupplierController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
