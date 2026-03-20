import { createSlice } from "@reduxjs/toolkit";
import { createAsyncThunkWrap } from "../handler";
import { FileParameter, FileUploadsResponseModel, Service } from "../../api";
import { ApiLoadingStatus } from "../../utils/loadingStatus";

interface IFileUploadState {
  file: FileUploadsResponseModel;
  getFileByPromptIdStatus: ApiLoadingStatus;
  uploadFileStatus: ApiLoadingStatus;
  deleteFileStatus: ApiLoadingStatus;
}

const initialState: IFileUploadState = {
  file: {} as FileUploadsResponseModel,
  getFileByPromptIdStatus: ApiLoadingStatus.None,
  uploadFileStatus: ApiLoadingStatus.None,
  deleteFileStatus: ApiLoadingStatus.None,
};

export const uploadFile = createAsyncThunkWrap(
  "/upload-file",
  async (file: FileParameter) => {
    return await Service.fileUploadService.uploadFile(file);
  }
);

export const getFileUploadsByPromptId = createAsyncThunkWrap(
  "/get-file",
  async (promptId: string) => {
    return await Service.fileUploadService.getFileUploadsByPromptId(promptId);
  }
);

export const deleteFile = createAsyncThunkWrap(
  "/delete-file",
  async (fileId: string) => {
    return await Service.fileUploadService.deleteFileUpload(fileId);
  }
);

export const fileUploadSlice = createSlice({
  name: "fileUploadSlice",
  initialState,
  reducers: {
    resetUploadFile: (state) => {
      state.uploadFileStatus = ApiLoadingStatus.None;
    },
    resetGetFileByPromptIdStatus: (state) => {
      state.getFileByPromptIdStatus = ApiLoadingStatus.None;
    },
    resetDeleteFileStatus: (state) => {
      state.deleteFileStatus = ApiLoadingStatus.None;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(uploadFile.pending, (state) => {
        state.uploadFileStatus = ApiLoadingStatus.Loading;
      })
      .addCase(uploadFile.fulfilled, (state, action) => {
        state.uploadFileStatus = ApiLoadingStatus.Success;
      })
      .addCase(uploadFile.rejected, (state) => {
        state.uploadFileStatus = ApiLoadingStatus.Failed;
      })
      .addCase(getFileUploadsByPromptId.pending, (state) => {
        state.getFileByPromptIdStatus = ApiLoadingStatus.Loading;
      })
      .addCase(getFileUploadsByPromptId.fulfilled, (state, action) => {
        state.getFileByPromptIdStatus = ApiLoadingStatus.Success;
        state.file = action.payload;
      })
      .addCase(getFileUploadsByPromptId.rejected, (state) => {
        state.getFileByPromptIdStatus = ApiLoadingStatus.Failed;
        state.file = {} as FileUploadsResponseModel;
      })
      .addCase(deleteFile.pending, (state) => {
        state.deleteFileStatus = ApiLoadingStatus.Loading;
      })
      .addCase(deleteFile.fulfilled, (state) => {
        state.deleteFileStatus = ApiLoadingStatus.Success;
      })
      .addCase(deleteFile.rejected, (state) => {
        state.deleteFileStatus = ApiLoadingStatus.Failed;
      });
  },
});

export const {
  resetUploadFile,
  resetGetFileByPromptIdStatus,
  resetDeleteFileStatus,
} = fileUploadSlice.actions;

export default fileUploadSlice.reducer;
