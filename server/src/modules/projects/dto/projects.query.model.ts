import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class ProjectsQueryDto {
  @ApiPropertyOptional({
    description:
      'If set, returns the same as GET /projects/:id (WAF-friendly query form).',
  })
  @IsOptional()
  @IsString()
  id?: string;

  @ApiPropertyOptional({
    description: 'Filter by project name (case-insensitive substring match).',
  })
  @IsOptional()
  @IsString()
  project_name?: string;

  @ApiPropertyOptional({
    description:
      'Filter by application domain (case-insensitive substring match).',
  })
  @IsOptional()
  @IsString()
  application_domain?: string;
}
