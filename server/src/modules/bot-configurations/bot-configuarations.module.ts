import { Module } from '@nestjs/common';
import { BotConfigurationsController } from './bot-configurations.controller';
import { BotConfigurationService } from './bot-configurations.service';
import { BotConfiguration } from './bot-configurations.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([BotConfiguration])],

  controllers: [BotConfigurationsController],
  providers: [BotConfigurationService]
})
export class BotConfiguarationsModule {}
