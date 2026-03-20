import { Context } from "../utils/context";
import * as ApiClientFactory from "./api-generated";

export * from "./api-generated";

const api_url: string = Context.apiUrl ?? "http://localhost:3000";

// define authorize common function, we also can config interceptors here
const authorizedFetchFunction = (
  url: RequestInfo,
  init: RequestInit
): Promise<Response> => {
  const headers = {
    Accept: "application/json",
    "Content-Type": "application/json",
    Authorization: `Bearer ${Context.token}`,
  };
  init = init || {};
  init.headers = Object.assign({}, init.headers, headers);
  return fetch(url, init);
};

const userClient = new ApiClientFactory.UsersControllerClient(api_url, {
  fetch: authorizedFetchFunction,
});

const botConfigClient = new ApiClientFactory.BotConfigurationsControllerClient(
  api_url,
  {
    fetch: authorizedFetchFunction,
  }
);

const fileUploadClient = new ApiClientFactory.FileUploadsControllerClient(
  api_url,
  {
    fetch: authorizedFetchFunction,
  }
);

const projectClient = new ApiClientFactory.ProjectsControllerClient(api_url, {
  fetch: authorizedFetchFunction,
});

const promptClient = new ApiClientFactory.PromptsControllerClient(api_url, {
  fetch: authorizedFetchFunction,
});

interface IService {
  userService: ApiClientFactory.UsersControllerClient;
  fileUploadService: ApiClientFactory.FileUploadsControllerClient;
  botConfigService: ApiClientFactory.BotConfigurationsControllerClient;
  projectService: ApiClientFactory.ProjectsControllerClient;
  promptService: ApiClientFactory.PromptsControllerClient;
}

export const Service: IService = {
  userService: userClient,
  fileUploadService: fileUploadClient,
  botConfigService: botConfigClient,
  projectService: projectClient,
  promptService: promptClient,
};
