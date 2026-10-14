import { Test, TestingModule } from '@nestjs/testing';
import { DocumentSeriesController } from './document-series.controller';
import { DocumentSeriesService } from './document-series.service';

describe('DocumentSeriesController', () => {
  let controller: DocumentSeriesController;

  const mockService = {
    findAll: jest.fn().mockResolvedValue([]),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DocumentSeriesController],
      providers: [
        { provide: DocumentSeriesService, useValue: mockService },
      ],
    }).compile();

    controller = module.get<DocumentSeriesController>(DocumentSeriesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
