import { createSlice } from "@reduxjs/toolkit";
import { ApiLoadingStatus } from "../../utils/loadingStatus";
import { Service, UserRequestModel, UserResponseModel } from "../../api";
import { createAsyncThunkWrap } from "../handler";

interface IUserState {
  allUsers: UserResponseModel[];
  userById: UserResponseModel;
  userByEmail: UserResponseModel;
  createUserStatus: ApiLoadingStatus;
  findAllUsersStatus: ApiLoadingStatus;
  findUserByIdStatus: ApiLoadingStatus;
  findUserByEmailStatus: ApiLoadingStatus;
  updateUserStatus: ApiLoadingStatus;
}

const initialState: IUserState = {
  allUsers: [],
  userById: {} as UserResponseModel,
  userByEmail: {} as UserResponseModel,
  createUserStatus: ApiLoadingStatus.None,
  findAllUsersStatus: ApiLoadingStatus.None,
  findUserByIdStatus: ApiLoadingStatus.None,
  findUserByEmailStatus: ApiLoadingStatus.None,
  updateUserStatus: ApiLoadingStatus.None,
};

export const createUser = createAsyncThunkWrap(
  "/create-user",
  async (user: UserRequestModel) => await Service.userService.create(user)
);

export const findAllUsers = createAsyncThunkWrap(
  "/find-all-users",
  async () => await Service.userService.findAll()
);

export const findUserById = createAsyncThunkWrap(
  "/find-user-by-id",
  async (id: string) => await Service.userService.findOne(id)
);

export const findUserByEmail = createAsyncThunkWrap(
  "/find-user-by-email",
  async (email: string) => await Service.userService.findByEmail(email)
);

export const updateUser = createAsyncThunkWrap(
  "/update-user",
  async (user: UserRequestModel) =>
    await Service.userService.update(user.id, user)
);

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    resetCreateUserStatus: (state) => {
      state.createUserStatus = ApiLoadingStatus.None;
    },
    resetFindAllUsersStatus: (state) => {
      state.findAllUsersStatus = ApiLoadingStatus.None;
    },
    resetFindUserByIdStatus: (state) => {
      state.findUserByIdStatus = ApiLoadingStatus.None;
    },
    resetFindUserByEmailStatus: (state) => {
      state.findUserByEmailStatus = ApiLoadingStatus.None;
    },
    resetUpdateUserStatus: (state) => {
      state.updateUserStatus = ApiLoadingStatus.None;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createUser.pending, (state, action) => {
        state.createUserStatus = ApiLoadingStatus.Loading;
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.createUserStatus = ApiLoadingStatus.Success;
      })
      .addCase(createUser.rejected, (state, action) => {
        state.createUserStatus = ApiLoadingStatus.Failed;
      })
      .addCase(findAllUsers.pending, (state, action) => {
        state.findAllUsersStatus = ApiLoadingStatus.Loading;
      })
      .addCase(findAllUsers.fulfilled, (state, action) => {
        state.findAllUsersStatus = ApiLoadingStatus.Success;
        state.allUsers = action.payload;
      })
      .addCase(findAllUsers.rejected, (state, action) => {
        state.findAllUsersStatus = ApiLoadingStatus.Failed;
        state.allUsers = [];
      })
      .addCase(findUserById.pending, (state, action) => {
        state.findUserByIdStatus = ApiLoadingStatus.Loading;
      })
      .addCase(findUserById.fulfilled, (state, action) => {
        state.findUserByIdStatus = ApiLoadingStatus.Success;
        state.userById = action.payload;
      })
      .addCase(findUserById.rejected, (state, action) => {
        state.findUserByIdStatus = ApiLoadingStatus.Failed;
        state.userById = {} as UserResponseModel;
      })
      .addCase(findUserByEmail.pending, (state, action) => {
        state.findUserByEmailStatus = ApiLoadingStatus.Loading;
      })
      .addCase(findUserByEmail.fulfilled, (state, action) => {
        state.findUserByEmailStatus = ApiLoadingStatus.Success;
        state.userByEmail = action.payload;
      })
      .addCase(findUserByEmail.rejected, (state, action) => {
        state.findUserByEmailStatus = ApiLoadingStatus.Failed;
        state.userByEmail = {} as UserResponseModel;
      })
      .addCase(updateUser.pending, (state, action) => {
        state.updateUserStatus = ApiLoadingStatus.Loading;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.updateUserStatus = ApiLoadingStatus.Success;
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.updateUserStatus = ApiLoadingStatus.Failed;
      });
  },
});

export const {
  resetCreateUserStatus,
  resetFindAllUsersStatus,
  resetFindUserByIdStatus,
  resetFindUserByEmailStatus,
  resetUpdateUserStatus,
} = userSlice.actions;

export default userSlice.reducer;
