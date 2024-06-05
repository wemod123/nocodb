import axios from 'axios';
import { Injectable } from '@nestjs/common';
// import { isLinksOrLTAR, RelationTypes } from 'nocodb-sdk';
// import { nocoExecute } from 'nc-help';
// import type { LinkToAnotherRecordColumn } from '~/models';

// import { NcError } from '~/helpers/catchError';
// import getAst from '~/helpers/getAst';
// import { PagedResponseImpl } from '~/helpers/PagedResponse';
// import { Column, Model, Source, View } from '~/models';
// import NcConnectionMgrv2 from '~/utils/common/NcConnectionMgrv2';

@Injectable()
export class DatasetService {
  constructor() {}

  async datasetApi({
    method,
    url,
    data,
    token,
  }: {
    method: string;
    url: string;
    data?: any;
    token: string;
  }) {
    return await axios({
      method,
      url,
      data,
      baseURL: process.env.NC_DATASETS_API_HOST,
      headers: {
        'xc-auth': token,
      },
    })
      .then((v) => v.data)
      .catch((e) => e.response.data);
  }

  async getDatasetMeta(table_id: string, token: string) {
    return await this.datasetApi({
      method: 'GET',
      url: `/tables/${table_id}/meta`,
      token,
    });
  }

  async refreshDataset(table_id: string, token: string) {
    return await this.datasetApi({
      method: 'GET',
      url: `/tables/${table_id}/reload`,
      token,
    });
  }

  async deleteDataset(table_id: string, token: string) {
    return await this.datasetApi({
      method: 'DELETE',
      url: `/tables/${table_id}/delete`,
      token,
    });
  }
}
