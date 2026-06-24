import { Controller, Get, Post, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { AssetsService } from './assets.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('assets')
@UseGuards(JwtAuthGuard)
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) {}

  @Get()
  async getAssets(@CurrentUser() user: any) {
    return this.assetsService.getAssets(BigInt(user.companyId), user);
  }

  @Post()
  async createAsset(@Body() body: any, @CurrentUser() user: any) {
    return this.assetsService.createAsset(BigInt(user.companyId), body, user);
  }

  @Post(':assetId/assign')
  async assignAsset(
    @Param('assetId') assetId: string,
    @Body() body: any,
    @CurrentUser() user: any
  ) {
    return this.assetsService.assignAsset(BigInt(assetId), body, user);
  }

  @Post(':assetId/return')
  async returnAsset(@Param('assetId') assetId: string, @CurrentUser() user: any) {
    return this.assetsService.returnAsset(BigInt(assetId), user);
  }

  @Patch(':assetId/condition')
  async updateCondition(
    @Param('assetId') assetId: string,
    @Body('condition') condition: string,
    @CurrentUser() user: any
  ) {
    return this.assetsService.updateCondition(BigInt(assetId), condition, user);
  }

  @Get('analytics')
  async getAssetAnalytics(@CurrentUser() user: any) {
    return this.assetsService.getAssetAnalytics(BigInt(user.companyId), user);
  }
}
