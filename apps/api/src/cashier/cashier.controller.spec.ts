import { Test, TestingModule } from '@nestjs/testing';
import { CashierController } from './cashier.controller';
import { CashierService } from './cashier.service';

describe('CashierController', () => {
  let controller: CashierController;

  const mockService = {
    getCurrentShift: jest.fn().mockResolvedValue(null),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CashierController],
      providers: [
        { provide: CashierService, useValue: mockService },
      ],
    }).compile();

    controller = module.get<CashierController>(CashierController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
