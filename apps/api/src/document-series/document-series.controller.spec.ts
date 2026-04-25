import { Test, TestingModule } from '@nestjs/testing';
import { DocumentSeriesController } from './document-series.controller';

describe('DocumentSeriesController', () => {
  let controller: DocumentSeriesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DocumentSeriesController],
    }).compile();

    controller = module.get<DocumentSeriesController>(DocumentSeriesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
