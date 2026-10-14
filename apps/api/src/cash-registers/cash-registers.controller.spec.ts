import { Test, TestingModule } from '@nestjs/testing';
import { CashRegistersController } from './cash-registers.controller';
import { CashRegistersService } from './cash-registers.service';

describe('CashRegistersController', () => {
  let controller: CashRegistersController;

  const mockService = {
    getCurrentRegister: jest.fn().mockResolvedValue(null),
    openRegister: jest.fn().mockResolvedValue({ id: 'cr-1' }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CashRegistersController],
      providers: [
        { provide: CashRegistersService, useValue: mockService },
      ],
    }).compile();

    controller = module.get<CashRegistersController>(CashRegistersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
