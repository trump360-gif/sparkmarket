import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { PrismaService } from '../prisma/prisma.service';
import { CommissionService } from '../commission/commission.service';
import { ModerationService } from '../moderation/moderation.service';
import { RecentViewsService } from '../recent-views/recent-views.service';
import { HashtagsService } from '../hashtags/hashtags.service';
import { KeywordAlertsService } from '../keyword-alerts/keyword-alerts.service';
import { FollowsService } from '../follows/follows.service';
import { NotificationsService } from '../notifications/notifications.service';

describe('ProductsService', () => {
  let service: ProductsService;

  const mockPrismaService = {};
  const mockCommissionService = {};
  const mockModerationService = {};
  const mockRecentViewsService = {};
  const mockHashtagsService = {};
  const mockKeywordAlertsService = {};
  const mockFollowsService = {};
  const mockNotificationsService = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: CommissionService, useValue: mockCommissionService },
        { provide: ModerationService, useValue: mockModerationService },
        { provide: RecentViewsService, useValue: mockRecentViewsService },
        { provide: HashtagsService, useValue: mockHashtagsService },
        { provide: KeywordAlertsService, useValue: mockKeywordAlertsService },
        { provide: FollowsService, useValue: mockFollowsService },
        { provide: NotificationsService, useValue: mockNotificationsService },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
