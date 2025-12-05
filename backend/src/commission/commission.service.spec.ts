import { Test, TestingModule } from '@nestjs/testing';
import { CommissionService } from './commission.service';
import { PrismaService } from '../prisma/prisma.service';

describe('CommissionService', () => {
  let service: CommissionService;

  const mockPrismaService = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommissionService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<CommissionService>(CommissionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
