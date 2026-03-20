import React from "react";
import "./account.details.scss";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "../../redux/hook";
import { ApiLoadingStatus } from "../../utils/loadingStatus";

export function AccountDetail() {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const [accountData, setData] = React.useState();
  const dataState = useAppSelector((state) => state.user);

  return <div className="account-info"></div>;
}
