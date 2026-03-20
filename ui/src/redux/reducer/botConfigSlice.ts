import { createSlice } from "@reduxjs/toolkit";
import { ApiLoadingStatus } from "../../utils/loadingStatus";
import { BotConfigRequest, BotConfigResponse, Service } from "../../api";
import { createAsyncThunkWrap } from "../handler";

interface IBotConfigState {
  botConfig: BotConfigResponse;
  getByPromtIdStatus: ApiLoadingStatus;
  updateOrCreateBotConfigStatus: ApiLoadingStatus;
  deleteBotConfigStatus: ApiLoadingStatus;
}

const initialState: IBotConfigState = {
  botConfig: {} as BotConfigResponse,
  getByPromtIdStatus: ApiLoadingStatus.None,
  updateOrCreateBotConfigStatus: ApiLoadingStatus.None,
  deleteBotConfigStatus: ApiLoadingStatus.None,
};

export const getByPromtId = createAsyncThunkWrap(
  "/get-bot-config-by-promt-id",
  async (id: number) => {
    return await Service.botConfigService.getByPromtId(id);
  }
);

export const updateOrCreateBotConfig = createAsyncThunkWrap(
  "/update-or-create-bot-config",
  async (botConfigReq: BotConfigRequest) => {
    return await Service.botConfigService.updateOrCreateBotConfig(botConfigReq);
  }
);

export const deleteBotConfig = createAsyncThunkWrap(
  "/delete-bot-config",
  async () => {
    return await Service.botConfigService.deleteById();
  }
);

export const botConfigSlice = createSlice({
  name: "botConfig",
  initialState,
  reducers: {
    resetGetByPromtIdStatus: (state) => {
      state.getByPromtIdStatus = ApiLoadingStatus.None;
    },
    resetUpdateOrCreateBotConfig: (state) => {
      state.updateOrCreateBotConfigStatus = ApiLoadingStatus.None;
    },
    resetDeleteBotConfigStatus: (state) => {
      state.deleteBotConfigStatus = ApiLoadingStatus.None;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getByPromtId.pending, (state) => {
        state.getByPromtIdStatus = ApiLoadingStatus.Loading;
      })
      .addCase(getByPromtId.fulfilled, (state, action) => {
        state.getByPromtIdStatus = ApiLoadingStatus.Success;
        state.botConfig = action.payload;
      })
      .addCase(getByPromtId.rejected, (state) => {
        state.getByPromtIdStatus = ApiLoadingStatus.Failed;
        state.botConfig = {} as BotConfigResponse;
      })
      .addCase(updateOrCreateBotConfig.pending, (state) => {
        state.updateOrCreateBotConfigStatus = ApiLoadingStatus.Loading;
      })
      .addCase(updateOrCreateBotConfig.fulfilled, (state) => {
        state.updateOrCreateBotConfigStatus = ApiLoadingStatus.Success;
      })
      .addCase(updateOrCreateBotConfig.rejected, (state) => {
        state.updateOrCreateBotConfigStatus = ApiLoadingStatus.Failed;
      })
      .addCase(deleteBotConfig.pending, (state) => {
        state.deleteBotConfigStatus = ApiLoadingStatus.Loading;
      })
      .addCase(deleteBotConfig.fulfilled, (state) => {
        state.deleteBotConfigStatus = ApiLoadingStatus.Success;
      })
      .addCase(deleteBotConfig.rejected, (state) => {
        state.deleteBotConfigStatus = ApiLoadingStatus.Failed;
      });
  },
});

export const {
  resetGetByPromtIdStatus,
  resetUpdateOrCreateBotConfig,
  resetDeleteBotConfigStatus,
} = botConfigSlice.actions;

export default botConfigSlice.reducer;
