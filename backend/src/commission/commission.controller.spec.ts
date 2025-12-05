import { Test, TestingModule } from '@nestjs/testing';
import { CommissionController } from './commission.controller';
import { CommissionService } from './commission.service';

describe('CommissionController', () => {
  let controller: CommissionController;

  const mockCommissionService = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommissionController],
      providers: [
        {
          provide: CommissionService,
          useValue: mockCommissionService,
        },
      ],
    }).compile();

    controller = module.get<CommissionController>(CommissionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
