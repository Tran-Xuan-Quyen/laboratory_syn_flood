import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ProjectsUpdateModel } from './dto/projects.update.model';
import { ProjectsResponseModel } from './dto/projects.response.model';
import { plainToInstance } from 'class-transformer';
import { ProjectsRequestModel } from './dto/projects.request.model';
import { ProjectsQueryDto } from './dto/projects.query.model';
import { UsersService } from '../users/users.service';

@ApiTags('projects')
@ApiBearerAuth()
@Controller('projects')
export class ProjectsController {
  constructor(
    private readonly projectsService: ProjectsService,
    private readonly usersService: UsersService,
  ) {}

  @Get()
  @ApiOperation({
    summary:
      'Get all projects (optional filters), or one project when id query is set',
  })
  @ApiQuery({
    name: 'id',
    required: false,
    description:
      'If set, returns the same as GET /projects/:id (WAF-friendly query form).',
  })
  @ApiQuery({
    name: 'project_name',
    required: false,
    description:
      'Filter by project name (case-insensitive substring). Ignored if id is set.',
  })
  @ApiQuery({
    name: 'application_domain',
    required: false,
    description:
      'Filter by application domain (case-insensitive substring). Ignored if id is set.',
  })
  @ApiResponse({
    status: 200,
    description: 'Return all projects, or one project when id is provided.',
    type: [ProjectsResponseModel],
  })
  async findAll(@Query() query: ProjectsQueryDto) {
    const { id, project_name, application_domain } = query;
    if (id !== undefined && id !== '') {
      const num = Number(id);
      if (!Number.isInteger(num) || num < 1) {
        throw new BadRequestException('Query id must be a positive integer');
      }
      console.log(`[P]:::Get project by query id: ${num}`);
      const project = await this.projectsService.findOne(num);
      return plainToInstance(ProjectsResponseModel, project);
    }
    const projectName = project_name?.trim();
    const applicationDomain = application_domain?.trim();
    const listFilters =
      projectName || applicationDomain
        ? {
            ...(projectName ? { projectName } : {}),
            ...(applicationDomain ? { applicationDomain } : {}),
          }
        : undefined;
    console.log(`[P]:::Get all projects data`);
    const projects = await this.projectsService.findAll(listFilters);
    let result = plainToInstance(ProjectsResponseModel, projects);
    return result;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a project by ID' })
  @ApiResponse({
    status: 200,
    description: 'Return the project.',
    type: ProjectsResponseModel,
  })
  async findOne(@Param('id') id: string) {
    console.log(`[P]:::Get project by id: ${id}`);
    const project = await this.projectsService.findOne(+id);
    let result = plainToInstance(ProjectsResponseModel, project);
    return result;
  }

  @Post()
  @ApiOperation({ summary: 'Create a new project' })
  @ApiResponse({
    status: 201,
    description: 'The project has been successfully created.',
    type: ProjectsResponseModel,
  })
  async create(@Body() createProjectDto: ProjectsRequestModel) {
    console.log(`[P]:::Create project: ${createProjectDto}`);
    const project = await this.projectsService.create(createProjectDto);
    let result = plainToInstance(ProjectsResponseModel, project);
    return result;
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a project by ID' })
  @ApiResponse({
    status: 200,
    description: 'The project has been successfully updated.',
    type: ProjectsResponseModel,
  })
  async update(
    @Param('id') id: string,
    @Body() updateProjectDto: ProjectsUpdateModel,
  ) {
    console.log(`[P]:::Update project: ${id} with ${updateProjectDto}`);
    const project = await this.projectsService.update(+id, updateProjectDto);
    let result = plainToInstance(ProjectsResponseModel, project);
    return result;
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a project by ID' })
  @ApiResponse({
    status: 200,
    description: 'The project has been successfully deleted.',
  })
  async delete(@Param('id') id: string): Promise<void> {
    console.log(`[P]:::Delete project: ${id}`);
    return this.projectsService.delete(+id);
  }
}
