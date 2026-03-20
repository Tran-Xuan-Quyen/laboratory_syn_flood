import { stat } from "fs";
import { PromptRequestModel, PromptResponseModel, Service } from "../../api";
import { ApiLoadingStatus } from "../../utils/loadingStatus";
import { createAsyncThunkWrap } from "../handler";
import { createSlice } from "@reduxjs/toolkit";

interface IPromptState {
  prompts: PromptResponseModel[];
  promptById: PromptResponseModel;
  createPromptStatus: ApiLoadingStatus;
  findAllPromptsStatus: ApiLoadingStatus;
  findPromptByIdStatus: ApiLoadingStatus;
  updatePromptStatus: ApiLoadingStatus;
  deletePromptStatus: ApiLoadingStatus;
}

const initialState: IPromptState = {
  prompts: [],
  promptById: {} as PromptResponseModel,
  createPromptStatus: ApiLoadingStatus.None,
  findAllPromptsStatus: ApiLoadingStatus.None,
  findPromptByIdStatus: ApiLoadingStatus.None,
  updatePromptStatus: ApiLoadingStatus.None,
  deletePromptStatus: ApiLoadingStatus.None,
};

export const createPrompt = createAsyncThunkWrap(
  "/create-prompt",
  async (prompt: PromptRequestModel) => {
    return await Service.promptService.create(prompt);
  }
);

export const findAllPrompts = createAsyncThunkWrap(
  "/find-all-prompts",
  async () => {
    return await Service.promptService.findAll();
  }
);

export const findPromptById = createAsyncThunkWrap(
  "/find-prompt-by-id",
  async (id: string) => {
    return await Service.promptService.findOne(id);
  }
);

export const updatePrompt = createAsyncThunkWrap(
  "/update-prompt",
  async (id: string) => {
    return await Service.promptService.update(id);
  }
);

export const deletePrompt = createAsyncThunkWrap(
  "/delete-prompt",
  async (id: string) => {
    return await Service.promptService.remove(id);
  }
);

export const promptSlice = createSlice({
  name: "promptSlice",
  initialState,
  reducers: {
    resetCreatePromptStatus: (state) => {
      state.createPromptStatus = ApiLoadingStatus.None;
    },
    resetFindAllPromptsStatus: (state) => {
      state.findAllPromptsStatus = ApiLoadingStatus.None;
    },
    resetFindPromptByIdStatus: (state) => {
      state.findPromptByIdStatus = ApiLoadingStatus.None;
    },
    resetUpdatePromptStatus: (state) => {
      state.updatePromptStatus = ApiLoadingStatus.None;
    },
    resetDeletePromptStatus: (state) => {
      state.deletePromptStatus = ApiLoadingStatus.None;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createPrompt.pending, (state) => {
        state.createPromptStatus = ApiLoadingStatus.Loading;
      })
      .addCase(createPrompt.fulfilled, (state, action) => {
        state.createPromptStatus = ApiLoadingStatus.Success;
      })
      .addCase(createPrompt.rejected, (state) => {
        state.createPromptStatus = ApiLoadingStatus.Failed;
      })
      .addCase(findAllPrompts.pending, (state) => {
        state.findAllPromptsStatus = ApiLoadingStatus.Loading;
      })
      .addCase(findAllPrompts.fulfilled, (state, action) => {
        state.findAllPromptsStatus = ApiLoadingStatus.Success;
        state.prompts = action.payload;
      })
      .addCase(findAllPrompts.rejected, (state) => {
        state.findAllPromptsStatus = ApiLoadingStatus.Failed;
        state.prompts = [];
      })
      .addCase(findPromptById.pending, (state) => {
        state.findPromptByIdStatus = ApiLoadingStatus.Loading;
      })
      .addCase(findPromptById.fulfilled, (state, action) => {
        state.findPromptByIdStatus = ApiLoadingStatus.Success;
        state.promptById = action.payload;
      })
      .addCase(findPromptById.rejected, (state) => {
        state.findPromptByIdStatus = ApiLoadingStatus.Failed;
        state.promptById = {} as PromptResponseModel;
      })
      .addCase(updatePrompt.pending, (state) => {
        state.updatePromptStatus = ApiLoadingStatus.Loading;
      })
      .addCase(updatePrompt.fulfilled, (state) => {
        state.updatePromptStatus = ApiLoadingStatus.Success;
      })
      .addCase(updatePrompt.rejected, (state) => {
        state.updatePromptStatus = ApiLoadingStatus.Failed;
      })
      .addCase(deletePrompt.pending, (state) => {
        state.deletePromptStatus = ApiLoadingStatus.Loading;
      })
      .addCase(deletePrompt.fulfilled, (state) => {
        state.deletePromptStatus = ApiLoadingStatus.Success;
      })
      .addCase(deletePrompt.rejected, (state) => {
        state.deletePromptStatus = ApiLoadingStatus.Failed;
      });
  },
});

export const {
  resetCreatePromptStatus,
  resetFindAllPromptsStatus,
  resetFindPromptByIdStatus,
  resetUpdatePromptStatus,
  resetDeletePromptStatus,
} = promptSlice.actions;

export default promptSlice.reducer;
