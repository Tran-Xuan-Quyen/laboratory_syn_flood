import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./reducer/userSlice";
import projectReducer from "./reducer/projectSlice";
import promptReducer from "./reducer/promptSlice";
import botConfigReducer from "./reducer/botConfigSlice";
import fileUploadReducer from "./reducer/fileUploadSlice";

export const store = configureStore({
  reducer: {
    user: userReducer,
    project: projectReducer,
    prompt: promptReducer,
    botConfig: botConfigReducer,
    fileUpload: fileUploadReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
  devTools: true,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
