import * as React from "react";
import { User } from "../pages/user";
import { TeamOutlined } from "@ant-design/icons";

export interface IRouteItem {
  key: string;
  i18nKey?: string;
  url: string;
  label?: string;
  component?: React.FC<{}>;
  icon?: any;
  parentKeys?: string[];
  specificBeadTextKey?: string;
}

export const getPage = () => {
  return "Page";
};

export const adminRouterMappingGroup: { [key: string]: IRouteItem } = {
  User: {
    key: "/user",
    url: "/user",
    label: "Thông tin người dùng",
    component: User,
    icon: TeamOutlined,
  },
};

export const getRoutesByRole = (role: string) => {
  switch (role) {
    default:
      return {};
  }
};

export const routeMapping = {
  Login: {
    key: "/login",
    url: "/login",
  },
  LoginFailed: {
    key: "/login-failed",
    url: "/login-failed",
  },
  ErrorPage: {
    key: "/error",
    url: "/error",
  },
} as { [key: string]: IRouteItem };

export const getRouteItemByKey = (routeKey: string) => {
  let currentRouteItem = routeMapping.Home;
  for (const key in routeMapping) {
    const item = routeMapping[key];
    if (item.key === routeKey) {
      currentRouteItem = item;
    }
  }
  return currentRouteItem;
};

export const getRouteItemByUrl = (url: string) => {
  let currentRouteItem = routeMapping.Home;
  for (const key in routeMapping) {
    const item = routeMapping[key];
    if (item.url === url) {
      currentRouteItem = item;
    }
  }
  return currentRouteItem;
};
