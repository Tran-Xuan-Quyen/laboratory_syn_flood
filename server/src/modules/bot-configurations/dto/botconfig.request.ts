import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class BotConfigRequest {
    @ApiProperty()
    @IsNotEmpty()
    promptId: number;
    @ApiProperty()
    @IsNotEmpty()
    prompt: string;
    @ApiProperty()
    @IsNotEmpty()
    personality: string;
    @ApiProperty()
    @IsNotEmpty()
    startSuggestions: string;
    @ApiProperty()
    @IsNotEmpty()
    greeting: string;
    @ApiProperty()
    @IsNotEmpty()
    applicationDomains: string[];
    @ApiProperty()
    @IsNotEmpty()
    headerTitle: string;
    @ApiProperty()
    @IsNotEmpty()
    headerTitleColor: string;
    @ApiProperty()
    @IsNotEmpty()
    backgroundColor: string;
    @ApiProperty()
    @IsNotEmpty()
    logo: string;
}


