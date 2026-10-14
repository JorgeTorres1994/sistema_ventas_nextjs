import { Test, TestingModule } from '@nestjs/testing';
import { DocumentSeriesService } from './document-series.service';
import { PrismaService } from '../prisma.service';

describe('DocumentSeriesService', () => {
  let service: DocumentSeriesService;

  const mockPrisma = {
    documentSeries: {
      findMany: jest.fn().mockResolvedValue([]),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DocumentSeriesService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<DocumentSeriesService>(DocumentSeriesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
