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
    description: 'Filter by project name (snake_case query key).',
  })
  @IsOptional()
  @IsString()
  project_name?: string;

  @ApiPropertyOptional({
    description: 'Same as project_name (camelCase query key).',
  })
  @IsOptional()
  @IsString()
  projectName?: string;

  @ApiPropertyOptional({
    description:
      'Filter by application domain (snake_case query key).',
  })
  @IsOptional()
  @IsString()
  application_domain?: string;

  @ApiPropertyOptional({
    description: 'Same as application_domain (camelCase query key).',
  })
  @IsOptional()
  @IsString()
  applicationDomain?: string;
}
