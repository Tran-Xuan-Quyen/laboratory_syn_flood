import { Injectable, NotFoundException } from '@nestjs/common';
import { Project } from './projects.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ProjectsRequestModel } from './dto/projects.request.model';
import { ProjectsUpdateModel } from './dto/projects.update.model';
import { UserProject } from '../user-projects/user-projects.entity';
import { User } from '../users/users.entity';

export type ProjectsListFilters = {
  projectName?: string;
  applicationDomain?: string;
};

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private projectsRepository: Repository<Project>,
    @InjectRepository(UserProject)
    private userProjectsRepository: Repository<UserProject>,
  ) {}

  async findAll(filters?: ProjectsListFilters): Promise<Project[]> {
    try {
      let sql = `SELECT * FROM projects WHERE 1=1`;
      if (filters?.projectName) {
        sql += ` AND project_name = '${filters.projectName}'`;
      }
      if (filters?.applicationDomain) {
        sql += ` AND application_domain = '${filters.applicationDomain}'`;
      }
      const rows = await this.projectsRepository.query(sql);
      const projects = rows.map((row: Record<string, unknown>) =>
        this.mapProjectRow(row),
      );
      if (!projects.length) {
        throw new NotFoundException('No project found, please try again');
      }
      return projects;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Failed to fetch projects: ${error.message}`);
    }
  }

  private mapProjectRow(row: Record<string, unknown>): Project {
    return {
      id: row.id as number,
      projectName: row.project_name as string,
      applicationDomain: row.application_domain as string,
      description: row.description as string,
      createdAt: row.created_at as Date,
      updatedAt: row.updated_at as Date,
    } as Project;
  }

  async findOne(id: number): Promise<Project> {
    try {
      const project = await this.projectsRepository.findOne({
        where: { id },
      });
      if (!project) {
        throw new NotFoundException('No project found, please try again');
      }

      const additionalUsers = await this.getUsersByProjectId(id);
      return {
        ...project,
        users: [...(project.users || []), ...additionalUsers],
      };
    } catch (error) {
      throw new Error(`Failed to fetch project: ${error.message}`);
    }
  }

  async create(createProjectDto: ProjectsRequestModel): Promise<Project> {
    try {
      const project = this.projectsRepository.create(createProjectDto);
      return await this.projectsRepository.save(project);
    } catch (error) {
      throw new Error(`Failed to create project: ${error.message}`);
    }
  }

  async update(
    id: number,
    updateProjectDto: ProjectsUpdateModel,
  ): Promise<Project> {
    const project = await this.findOne(id);
    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }
    try {
      return this.projectsRepository.save({ ...project, ...updateProjectDto });
    } catch (error) {
      throw new Error(`Failed to update project: ${error.message}`);
    }
  }

  async delete(id: number): Promise<void> {
    try {
      const result = await this.projectsRepository.delete(id);
      if (result.affected === 0) {
        throw new NotFoundException(`Project with ID ${id} not found`);
      }
    } catch (error) {
      throw new Error(`Failed to delete project: ${error.message}`);
    }
  }

  async getUsersByProjectId(projectId: number): Promise<User[]> {
    try {
      const userProjects = await this.userProjectsRepository.find({
        where: { project_id: projectId },
        relations: ['user'],
      });

      return userProjects.map((up) => up.user);
    } catch (error) {
      throw new Error(`Failed to get users by project ID: ${error.message}`);
    }
  }
}
