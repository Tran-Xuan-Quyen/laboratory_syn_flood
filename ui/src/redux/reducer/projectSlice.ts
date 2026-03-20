import { createSlice } from "@reduxjs/toolkit";
import { createAsyncThunkWrap } from "../handler";
import {
  ProjectsRequestModel,
  ProjectsResponseModel,
  ProjectsUpdateModel,
  Service,
} from "../../api";
import { ApiLoadingStatus } from "../../utils/loadingStatus";

interface IProjectState {
  projects: ProjectsResponseModel[];
  projectById: ProjectsResponseModel;
  createProjectStatus: ApiLoadingStatus;
  findAllProjectsStatus: ApiLoadingStatus;
  findProjectByIdStatus: ApiLoadingStatus;
  updateProjectStatus: ApiLoadingStatus;
  deleteProjectStatus: ApiLoadingStatus;
}

const initialState: IProjectState = {
  projects: [],
  projectById: {} as ProjectsResponseModel,
  createProjectStatus: ApiLoadingStatus.None,
  findAllProjectsStatus: ApiLoadingStatus.None,
  findProjectByIdStatus: ApiLoadingStatus.None,
  updateProjectStatus: ApiLoadingStatus.None,
  deleteProjectStatus: ApiLoadingStatus.None,
};

export const createProject = createAsyncThunkWrap(
  "/create-project",
  async (project: ProjectsRequestModel) => {
    return await Service.projectService.create(project);
  }
);

export const findAllProjects = createAsyncThunkWrap(
  "/find-all-projects",
  async () => {
    return await Service.projectService.findAll();
  }
);

export const findProjectById = createAsyncThunkWrap(
  "/find-project-by-id",
  async (id: string) => {
    return await Service.projectService.findOne(id);
  }
);

export const updateProject = createAsyncThunkWrap(
  "/update-project",
  async ({ id, project }: { id: string; project: ProjectsUpdateModel }) => {
    return await Service.projectService.update(id, project);
  }
);

export const deleteProject = createAsyncThunkWrap(
  "/delete-project",
  async (id: string) => {
    return await Service.projectService.delete(id);
  }
);

export const projectSlice = createSlice({
  name: "projectSlice",
  initialState,
  reducers: {
    resetCreateProjectStatus: (state) => {
      state.createProjectStatus = ApiLoadingStatus.None;
    },
    resetFindAllProjectsStatus: (state) => {
      state.findAllProjectsStatus = ApiLoadingStatus.None;
    },
    resetFindProjectByIdStatus: (state) => {
      state.findProjectByIdStatus = ApiLoadingStatus.None;
    },
    resetUpdateProjectStatus: (state) => {
      state.updateProjectStatus = ApiLoadingStatus.None;
    },
    resetDeleteProjectStatus: (state) => {
      state.deleteProjectStatus = ApiLoadingStatus.None;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createProject.pending, (state) => {
        state.createProjectStatus = ApiLoadingStatus.Loading;
      })
      .addCase(createProject.fulfilled, (state, action) => {
        state.createProjectStatus = ApiLoadingStatus.Success;
      })
      .addCase(createProject.rejected, (state) => {
        state.createProjectStatus = ApiLoadingStatus.Failed;
      })
      .addCase(findAllProjects.pending, (state) => {
        state.findAllProjectsStatus = ApiLoadingStatus.Loading;
      })
      .addCase(findAllProjects.fulfilled, (state, action) => {
        state.findAllProjectsStatus = ApiLoadingStatus.Success;
        state.projects = action.payload;
      })
      .addCase(findAllProjects.rejected, (state) => {
        state.findAllProjectsStatus = ApiLoadingStatus.Failed;
        state.projects = [];
      })
      .addCase(findProjectById.pending, (state) => {
        state.findProjectByIdStatus = ApiLoadingStatus.Loading;
      })
      .addCase(findProjectById.fulfilled, (state, action) => {
        state.findProjectByIdStatus = ApiLoadingStatus.Success;
        state.projectById = action.payload;
      })
      .addCase(findProjectById.rejected, (state) => {
        state.findProjectByIdStatus = ApiLoadingStatus.Failed;
        state.projectById = {} as ProjectsResponseModel;
      })
      .addCase(updateProject.pending, (state) => {
        state.updateProjectStatus = ApiLoadingStatus.Loading;
      })
      .addCase(updateProject.fulfilled, (state, action) => {
        state.updateProjectStatus = ApiLoadingStatus.Success;
      })
      .addCase(updateProject.rejected, (state) => {
        state.updateProjectStatus = ApiLoadingStatus.Failed;
      })
      .addCase(deleteProject.pending, (state) => {
        state.deleteProjectStatus = ApiLoadingStatus.Loading;
      })
      .addCase(deleteProject.fulfilled, (state, action) => {
        state.deleteProjectStatus = ApiLoadingStatus.Success;
      })
      .addCase(deleteProject.rejected, (state) => {
        state.deleteProjectStatus = ApiLoadingStatus.Failed;
      });
  },
});

export const {
  resetCreateProjectStatus,
  resetFindAllProjectsStatus,
  resetFindProjectByIdStatus,
  resetUpdateProjectStatus,
  resetDeleteProjectStatus,
} = projectSlice.actions;

export default projectSlice.reducer;
