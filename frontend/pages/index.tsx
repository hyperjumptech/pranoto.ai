import { type KeyboardEventHandler, useState } from "react";
import Head from "next/head";
import {
  Button,
  Card,
  Col,
  Form,
  Input,
  Layout,
  Modal,
  Row,
  Space,
  Tag,
  Upload,
  message,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";

const { Meta } = Card;
const { Content, Header, Footer } = Layout;

export default function Home() {
  const [search, setSearch] = useState<string>("");
  const handleSearch: KeyboardEventHandler<HTMLInputElement> = (e) => {
    e.preventDefault();

    console.log(search);
  };

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const showModal = () => {
    setIsModalOpen(true);
  };

  return (
    <>
      <Head>
        <title>Pranoto.ai</title>
        <meta name="description" content="Video platform powered by AI" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Layout>
        <Header>
          <Row gutter={[24, 24]}>
            <Col span={12}>
              <Input
                placeholder="Search..."
                onChange={(e) => setSearch(e.target.value)}
                onPressEnter={handleSearch}
              />
            </Col>
            <Col span={6} offset={6} style={{ textAlign: "right" }}>
              <Button type="primary" onClick={showModal}>
                Add a new video
              </Button>
            </Col>
          </Row>
        </Header>
        <Content style={{ padding: "1.5rem" }}>
          <VideoList />
          <Modal
            title="Upload a new video"
            open={isModalOpen}
            onCancel={() => setIsModalOpen(false)}
            footer={false}
          >
            <AddNewVideoForm />
          </Modal>
        </Content>
        <Footer style={{ textAlign: "center" }}>
          Pranoto.ai ©2023 Created by{" "}
          <a
            href="https://hyperjump.tech/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Hyperjump
          </a>
        </Footer>
      </Layout>
    </>
  );
}

function AddNewVideoForm() {
  const onFinish = (values: any) => {
    console.log("Success:", values);
  };

  return (
    <Form layout="vertical" onFinish={onFinish}>
      <Form.Item label="Video">
        <Upload
          {...{
            accept: "video/*",
            name: "file",
            onChange(info) {
              if (info.file.status !== "uploading") {
                console.log(info.file, info.fileList);
              }
              if (info.file.status === "done") {
                message.success(`${info.file.name} file uploaded successfully`);
              } else if (info.file.status === "error") {
                message.error(`${info.file.name} file upload failed.`);
              }
            },
          }}
        >
          <Button icon={<UploadOutlined />}>Click to Upload</Button>
        </Upload>
      </Form.Item>
      <Form.Item label="Title" name="title">
        <Input />
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit">
          Add
        </Button>
      </Form.Item>
    </Form>
  );
}

type VideoStatus = "done" | "transcribing" | "converting" | "queueing";

type Video = {
  id: string;
  createdAt: string;
  status: VideoStatus;
  title: string;
  videoURL: string;
};

function VideoList() {
  const videos: Video[] = [
    {
      id: "1",
      createdAt: "Apr 1, 2023",
      status: "done",
      title: "Oppenheimer",
      videoURL: "/oppenheimer.mp4",
    },
    {
      id: "2",
      createdAt: "Apr 2, 2023",
      status: "transcribing",
      title: "Dunkirk",
      videoURL: "/dunkirk.mp4",
    },
    {
      id: "3",
      createdAt: "Apr 3, 2023",
      status: "converting",
      title: "Oppenheimer",
      videoURL: "/oppenheimer.mp4",
    },
    {
      id: "4",
      createdAt: "Apr 4, 2023",
      status: "queueing",
      title: "Dunkirk",
      videoURL: "/dunkirk.mp4",
    },
    {
      id: "5",
      createdAt: "Apr 4, 2023",
      status: "queueing",
      title: "Oppenheimer",
      videoURL: "/oppenheimer.mp4",
    },
    {
      id: "6",
      createdAt: "Apr 4, 2023",
      status: "queueing",
      title: "Oppenheimer",
      videoURL: "/oppenheimer.mp4",
    },
  ];

  return (
    <Row gutter={[24, 24]}>
      {videos.map(({ createdAt, id, status, title, videoURL }) => (
        <Col key={id} span={8}>
          <Card>
            <div
              style={{
                overflow: "hidden",
                maxWidth: "100%",
                paddingBottom: "0.5rem",
              }}
            >
              <video controls style={{ width: "100%" }}>
                <source src={videoURL} type="video/mp4" />
              </video>
            </div>
            <Meta
              title={title}
              description={
                <Space>
                  {createdAt}
                  <Tag color={getStatusColor(status)}>{capitalize(status)}</Tag>
                </Space>
              }
            />
          </Card>
        </Col>
      ))}
    </Row>
  );
}

function getStatusColor(videoStatus: VideoStatus): string {
  switch (videoStatus) {
    case "done":
      return "success";
    case "converting":
    case "transcribing":
      return "blue";

    default:
      return "";
  }
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
