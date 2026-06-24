import { Test, TestingModule } from '@nestjs/testing';
import { IngredientSupplierService } from './ingredient-supplier.service';

describe('IngredientSupplierService', () => {
  let service: IngredientSupplierService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [IngredientSupplierService],
    }).compile();

    service = module.get<IngredientSupplierService>(IngredientSupplierService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
