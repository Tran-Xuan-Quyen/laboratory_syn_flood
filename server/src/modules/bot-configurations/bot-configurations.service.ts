import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BotConfiguration } from './bot-configurations.entity';
import { Repository } from 'typeorm';
import { BotConfigResponse } from './dto/botconfig.response';
import { BotConfigRequest } from './dto/botconfig.request';

@Injectable()
export class BotConfigurationService {
    @InjectRepository(BotConfiguration)
    private botConfigurationRepository: Repository<BotConfiguration>
    public async getByPromtId(promtId: number): Promise<BotConfiguration> {
        const botConfig = await this.botConfigurationRepository.findOne({
            where: {
                promptId: promtId
            }
        });
        if (!botConfig) {
            throw new NotFoundException('No bot configuration found');
        }
        return botConfig;
    }
    public async updateOrCreateBotConfig(botConfigRequest: BotConfigRequest): Promise<BotConfiguration> {
        const fields = {
            personality: botConfigRequest.personality,
            startSuggestions: botConfigRequest.startSuggestions,
            greeting: botConfigRequest.greeting,
            applicationDomains: botConfigRequest.applicationDomains,
            headerTitle: botConfigRequest.headerTitle,
            headerTitleColor: botConfigRequest.headerTitleColor,
            backgroundColor: botConfigRequest.backgroundColor,
            logo: botConfigRequest.logo
        };
        let botConfig = await this.botConfigurationRepository.findOne({ where: { promptId: botConfigRequest.promptId } });
        try {
            if (!botConfig) {
                botConfig = this.botConfigurationRepository.create({ promptId: botConfigRequest.promptId, ...fields });
                return await this.botConfigurationRepository.save(botConfig);
            }
            await this.botConfigurationRepository.update({ promptId: botConfigRequest.promptId }, fields);
            const updated = await this.botConfigurationRepository.findOne({ where: { promptId: botConfigRequest.promptId } });
            if (!updated) throw new Error('Failed to retrieve updated bot configuration');
            return updated;
        } catch (error) {
            throw new Error(`Failed to upsert bot configuration: ${error.message}`);
        }
    }
    public async deleteById(body: any) {
        // const botConfig = await this.botConfigurationRepository.deleteById(body);
        // return botConfig;
    }
}
