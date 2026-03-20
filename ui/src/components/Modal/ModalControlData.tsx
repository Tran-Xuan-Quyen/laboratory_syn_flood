import * as React from "react";
import { Modal, Form } from "antd";
import { useTranslation } from "react-i18next";

const ModalComponent = (props: any, ref: any) => {
  const [form] = Form.useForm();
  const [data, setData] = React.useState<any>([]);
  const [isOpen, setIsOpen] = React.useState<boolean>(props.isOpen);
  const { t } = useTranslation();

  const handleData = (data: any) => {};

  return (
    <Modal
      title={props.title}
      open={isOpen}
      okText="Lưu"
      okType="primary"
      onOk={() => {}}
      cancelText="Hủy bỏ"
      onCancel={() => {
        setData([]);
        setIsOpen(false);
        form.resetFields();
      }}
      className={props.className}
    ></Modal>
  );
};

export const ModalControlData = React.forwardRef(ModalComponent);
