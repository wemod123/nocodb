import {
  Body,
  Controller,
  HttpCode,
  Patch,
  Request,
  UseGuards,
} from '@nestjs/common';

import { OrgUserRoles } from 'nocodb-sdk';

import { ConfigService } from '@nestjs/config';
import type { AppConfig } from '~/interface/config';
import { GlobalGuard } from '~/guards/global/global.guard';
import { Acl } from '~/middlewares/extract-ids/extract-ids.middleware';
import { AppHooksService } from '~/services/app-hooks/app-hooks.service';
import { UsersService } from '~/services/users/users.service';

@Controller()
export class UsersController {
  constructor(
    protected readonly usersService: UsersService,
    protected readonly appHooksService: AppHooksService,
    protected readonly config: ConfigService<AppConfig>,
  ) {}

  @Patch(['/api/v1/user/profile'])
  @UseGuards(GlobalGuard)
  @HttpCode(200)
  async update(@Body() body, @Request() req) {
    /** Only allow Super admin update profile */
    if (req.user.roles?.[OrgUserRoles.SUPER_ADMIN] !== true) {
      return 0;
    }

    await this.usersService.profileUpdate({
      id: req.user.id,
      params: body,
    });
    return 1;
  }

  @Patch(['/api/v3/user/metadata'])
  @UseGuards(GlobalGuard)
  @HttpCode(200)
  @Acl('UpdateUserMetaData')
  async updateUser(@Body() body, @Request() req) {
    /** Only allow Super admin update other users metadata */
    if (req.user.roles?.[OrgUserRoles.SUPER_ADMIN] !== true) {
      return 0;
    }

    await this.usersService.userMetaUpdate({
      id: body.id,
      params: body,
    });
    return 1;
  }
}
