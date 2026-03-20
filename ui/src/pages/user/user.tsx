import * as React from "react";
import { useAppDispatch, useAppSelector } from "../../redux/hook";
import DataTable from "../../components/Table/dataTable";

export const User: React.FC = () => {
  const dispatch = useAppDispatch();
  const [dataTable, setDataTable] = React.useState<any[]>([]);

  const columns = [
    {
      title: "Tên người dùng",
      dataIndex: "username",
      key: "username",
      type: "text",
      isEdit: true,
      searchable: true,
    },
    {
      title: "Giới tính",
      dataIndex: "gender",
      key: "gender",
      type: "select",
      isEdit: true,
      filters: [
        {
          text: "Nam",
          value: 1,
        },
        {
          text: "Nữ",
          value: 2,
        },
      ],
    },
    {
      title: "Ngày sinh",
      dataIndex: "birth",
      key: "birth",
      type: "date",
      isEdit: true,
    },
    {
      title: "Số điện thoại",
      dataIndex: "phone_number",
      key: "phone_number",
      type: "text",
      isEdit: true,
      searchable: true,
    },
    {
      title: "Chức vụ",
      dataIndex: "role_id",
      key: "role_id",
      type: "select",
      isEdit: true,
    },
  ];

  return (
    <>
      <DataTable column={columns} name={"Sample table"} data={dataTable} />
    </>
  );
};
