import {
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { Acl } from '~/middlewares/extract-ids/extract-ids.middleware';
import { DatasetService } from '~/services/_dataset.service';
import { parseHrtimeToMilliSeconds } from '~/helpers';
import { DataApiLimiterGuard } from '~/guards/data-api-limiter.guard';
import { GlobalGuard } from '~/guards/global/global.guard';

@Controller()
@UseGuards(DataApiLimiterGuard, GlobalGuard)
export class DatasetController {
  constructor(private readonly datasetService: DatasetService) {}

  @Get('/api/v2/datasets/:modelId/meta')
  @Acl('dataList')
  async dataList(
    @Req() req: Request,
    @Res() res: Response,
    @Param('modelId') modelId: string,
  ) {
    const startTime = process.hrtime();
    const responseData = await this.datasetService.getDatasetMeta(
      modelId,
      req.headers['xc-auth'],
    );
    const elapsedSeconds = parseHrtimeToMilliSeconds(process.hrtime(startTime));
    res.setHeader('xc-dataset-response', elapsedSeconds);
    res.json(responseData);
  }

  @Patch('/api/v2/datasets/:modelId/refresh')
  @Acl('dataList')
  async refreshDataset(
    @Req() req: Request,
    @Res() res: Response,
    @Param('modelId') modelId: string,
  ) {
    const startTime = process.hrtime();
    const responseData = await this.datasetService.refreshDataset(
      modelId,
      req.headers['xc-auth'],
    );
    const elapsedSeconds = parseHrtimeToMilliSeconds(process.hrtime(startTime));
    res.setHeader('xc-dataset-response', elapsedSeconds);
    res.json(responseData);
  }

  @Delete('/api/v2/datasets/:modelId')
  @Acl('dataList')
  async deleteDataset(
    @Req() req: Request,
    @Res() res: Response,
    @Param('modelId') modelId: string,
  ) {
    const startTime = process.hrtime();
    const responseData = await this.datasetService.deleteDataset(
      modelId,
      req.headers['xc-auth'],
    );
    const elapsedSeconds = parseHrtimeToMilliSeconds(process.hrtime(startTime));
    res.setHeader('xc-dataset-response', elapsedSeconds);
    res.json(responseData);
  }
}
