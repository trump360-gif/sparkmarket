import { Test, TestingModule } from '@nestjs/testing';
import { ImagesService } from './images.service';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';

describe('ImagesService', () => {
  let service: ImagesService;

  const mockConfigService = {
    get: jest.fn(() => 'test-bucket'),
    getOrThrow: jest.fn(() => 'test-bucket'),
  };
  const mockPrismaService = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ImagesService,
        { provide: ConfigService, useValue: mockConfigService },
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<ImagesService>(ImagesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
