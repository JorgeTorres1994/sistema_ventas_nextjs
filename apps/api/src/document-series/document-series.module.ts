import { Module } from '@nestjs/common';
import { DocumentSeriesService } from './document-series.service.js';
import { DocumentSeriesController } from './document-series.controller.js';
import { PrismaModule } from '../prisma.module.js';

@Module({
  imports: [PrismaModule],
  controllers: [DocumentSeriesController],
  providers: [DocumentSeriesService],
  exports: [DocumentSeriesService]
})
export class DocumentSeriesModule {}
