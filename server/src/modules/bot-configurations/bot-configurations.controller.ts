import { Controller, Get, Post, Body, Res, Param } from '@nestjs/common';
import { BotConfigurationService } from './bot-configurations.service';
import { Response } from 'express';
import { BotConfigRequest } from './dto/botconfig.request';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { BotConfigResponse } from './dto/botconfig.response';
import { plainToInstance } from 'class-transformer';
@Controller('bot-config')
export class BotConfigurationsController {
    constructor(private readonly botConfigurationService: BotConfigurationService) {}
    
    @Get('prompt-id/:promptId')
    @ApiOperation({ summary: 'Get bot configuration by prompt id' })
    @ApiResponse({
        status: 201,
        description: 'The user has been successfully created.',
        type: BotConfigResponse,
      })
    async getByPromtId( @Param('promptId') promptId: number) {
        console.log(`[G]:::Get bot configuration by prompt id: ${promptId}`);
        const botConfig = await this.botConfigurationService.getByPromtId(promptId);
        const result = plainToInstance(BotConfigResponse, botConfig);
        return result;
    }
    @Post('update')
    async updateOrCreateBotConfig(@Body() body: BotConfigRequest): Promise<boolean> {
        try {
            await this.botConfigurationService.updateOrCreateBotConfig(body);
            return true;
        } catch (e) {
            return false;
        }
    }
    @Post('delete')
    async deleteById(@Body() body: any) {
        const botConfig = await this.botConfigurationService.deleteById(body);
        return botConfig;
    }
    

}
