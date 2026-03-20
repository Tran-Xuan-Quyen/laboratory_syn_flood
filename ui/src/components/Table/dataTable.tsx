import React, { useRef, useState } from "react";
import { Table, Button, Input, Space } from "antd";
import {
  SearchOutlined,
  DeleteOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import "./dataTable.scss";
import Highlighter from "react-highlight-words";
import type { FilterDropdownProps } from "antd/es/table/interface";

interface Props {
  data: any[];
  name?: string;
  column: any[];
  loading?: boolean;
  deleteButton?: boolean;
  deleteFunction?: (id: any) => void;
  customButton?: React.ReactNode;
  customData?: React.ReactNode;
  hasCheckBox?: "checkbox" | "radio";
}

const DataTable = (props: Props) => {
  const [searchText, setSearchText] = useState("");
  const searchInput = useRef<any>(null);
  const [searchedColumn, setSearchedColumn] = useState("");
  const [tableData, setTableData] = useState<any[]>([]);
  const [deleteButton, setDeleteButton] = useState<boolean>(false);
  const [tableKey, setTableKey] = useState(0);

  const handleSearch = (
    selectedKeys: string[],
    confirm: () => void,
    dataIndex: string
  ) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleReset = (clearFilters: () => void) => {
    clearFilters();
    setSearchText("");
  };

  const resetFilters = () => {
    setTableKey((tableKey) => tableKey + 1);
    setSearchText("");
  };

  const getColumnSearchProps = (dataIndex: string) => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
      close,
    }: FilterDropdownProps) => (
      <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
        <Input
          ref={searchInput}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() =>
            handleSearch(selectedKeys as string[], confirm, dataIndex)
          }
          style={{ marginBottom: 8, display: "block" }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() =>
              handleSearch(selectedKeys as string[], confirm, dataIndex)
            }
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            Search
          </Button>
          <Button
            onClick={() => clearFilters && handleReset(clearFilters)}
            size="small"
            style={{ width: 90 }}
          >
            Reset
          </Button>
          <Button type="link" size="small" onClick={() => close()}>
            Close
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered: boolean) => (
      <SearchOutlined style={{ color: filtered ? "#1677ff" : undefined }} />
    ),
    onFilter: (value: any, record: any) =>
      record[dataIndex]
        ?.toString()
        .toLowerCase()
        .includes((value as string).toLowerCase()),
    render: (text: string) =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{ backgroundColor: "#ffc069", padding: 0 }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ""}
        />
      ) : (
        text
      ),
  });

  const columnsWithSearch = props.column.map((col) => ({
    ...col,
    ...(col.searchable ? getColumnSearchProps(col.dataIndex) : {}),
  }));

  return (
    <>
      <h2>{props.name}</h2>
      {props?.customData}
      <div className="list-btn-actions">
        {props.deleteButton && (
          <Button
            icon={<DeleteOutlined />}
            disabled={!deleteButton}
            className="delete-btn"
            onClick={() => {}}
          >
            Xóa
          </Button>
        )}
        <Button icon={<ReloadOutlined />} onClick={() => resetFilters()}>
          Xóa bộ lọc và tìm kiếm
        </Button>
      </div>
      <Table
        key={tableKey}
        loading={props.loading}
        bordered
        columns={columnsWithSearch}
        dataSource={tableData}
      />
    </>
  );
};

export default DataTable;
