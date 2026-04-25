import { Test, TestingModule } from '@nestjs/testing';
import { DocumentSeriesService } from './document-series.service';

describe('DocumentSeriesService', () => {
  let service: DocumentSeriesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DocumentSeriesService],
    }).compile();

    service = module.get<DocumentSeriesService>(DocumentSeriesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
