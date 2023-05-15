import { type KeyboardEventHandler, useState, useEffect } from "react";
import Head from "next/head";
import {
  Alert,
  Button,
  Card,
  Col,
  Empty,
  Form,
  Input,
  Layout,
  List,
  Modal,
  Row,
  Skeleton,
  Space,
  Tag,
  Typography,
  Upload,
  message,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import useSWR from "swr";
import {
  formatDistanceToNow,
  fromUnixTime,
  intervalToDuration,
} from "date-fns";
import { object, string } from "yup";
import axios from "axios";
import { RcFile } from "antd/es/upload";
import { type Video, VideoStatus, Segment } from "@prisma/client";
import { axiosInstance, fetcher } from "@/pkg/fetcher";

const { Meta } = Card;
const { Content, Header, Footer } = Layout;
const { Title } = Typography;

export default function Home() {
  const [search, setSearch] = useState<string>("");
  const { data, error, isLoading, mutate } = useSWR(
    search ? `/v1/videos?q=${search}` : "/v1/videos",
    fetcher
  );
  const handleSearch: KeyboardEventHandler<HTMLInputElement> = (e) => {
    e.preventDefault();

    setSearch(search);
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
                Upload
              </Button>
            </Col>
          </Row>
        </Header>
        <Content style={{ padding: "1.5rem 3rem" }}>
          <Title level={1}>Videos</Title>
          <VideoList
            error={error}
            isLoading={isLoading}
            searchQuery={search}
            videos={data?.data}
          />
          <Modal
            title="Add a video"
            open={isModalOpen}
            onCancel={() => setIsModalOpen(false)}
            footer={false}
          >
            <AddVideoForm
              onSuccess={() => {
                mutate();
                setIsModalOpen(false);
              }}
            />
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

type AddVideoFormProps = {
  onSuccess: () => void;
};

function AddVideoForm({ onSuccess }: AddVideoFormProps) {
  const [form] = Form.useForm();
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const [videoFile, setVideoFile] = useState<RcFile | null>(null);
  const [isSubmitting, setSubmitting] = useState<boolean>(false);
  const onFinish = async (values: Pick<Video, "title">) => {
    // prevent double submit
    if (isSubmitting) {
      return;
    }
    setSubmitting(true);

    // validate input
    try {
      if (!videoFile) {
        setValidationErrors({ video: "Video is required" });
        return;
      }

      const videoSchema = object({
        title: string().required().label("Title"),
      }).noUnknown();

      await videoSchema.validate(values, { abortEarly: false });
    } catch (error: any) {
      let errors: Record<string, string> = {};

      error.inner.forEach((error: any) => {
        errors[error.path] = error.message;
      });

      setValidationErrors(errors);
      return;
    } finally {
      setSubmitting(false);
    }

    // create video
    try {
      const { data } = await axiosInstance.post("/v1/videos", {
        type: videoFile.type,
        title: values.title,
      });

      // upload video to object storage
      const { id, presignedURL } = data.data;
      await axios.put(presignedURL, videoFile);

      // update the video url
      const video = {
        status: VideoStatus.QUEUEING,
        text: "",
        title: values.title,
        url: presignedURL.split("?")[0],
      };
      await axiosInstance.put(`/v1/videos/${id}`, video);

      onSuccess();

      // reset form
      setVideoFile(null);
      form.resetFields();

      message.success("Video has been uploaded.");
    } catch (error: any) {
      console.error(error);

      if (error.response) {
        message.error(error.response.data.error);
        return;
      }

      message.error("Failed to create video. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Form form={form} layout="vertical" onFinish={onFinish}>
      <Form.Item
        label="Title"
        name="title"
        validateStatus={validationErrors?.title ? "error" : ""}
        help={validationErrors?.title}
      >
        <Input status={validationErrors?.title ? "error" : ""} />
      </Form.Item>
      <Form.Item
        label="Video"
        validateStatus={validationErrors?.video ? "error" : ""}
        help={validationErrors?.video}
      >
        <Upload
          accept="video/*"
          name="videoFile"
          multiple={false}
          beforeUpload={(file) => {
            setVideoFile(file);
            setValidationErrors((ve) => {
              delete ve["video"];
              return ve;
            });
            return false;
          }}
          onRemove={() => {
            setVideoFile(null);
          }}
          showUploadList={false}
        >
          <Button icon={<UploadOutlined />}>Choose a Video</Button>
          {videoFile && (
            <div
              style={{
                overflow: "hidden",
                paddingTop: "0.5rem",
              }}
            >
              <video controls style={{ width: "100%" }}>
                <source
                  src={URL.createObjectURL(videoFile)}
                  type={videoFile.type}
                />
              </video>
            </div>
          )}
        </Upload>
      </Form.Item>
      <Form.Item>
        <Button
          type="primary"
          htmlType="submit"
          disabled={isSubmitting}
          loading={isSubmitting}
        >
          Upload
        </Button>
      </Form.Item>
    </Form>
  );
}

type VideoListProps = {
  error: string;
  isLoading: boolean;
  searchQuery: string;
  videos: Video[];
};

function VideoList({ error, isLoading, searchQuery, videos }: VideoListProps) {
  if (error) {
    return (
      <Alert
        message="Error!"
        description="Failed to get video data. Please try again."
        type="error"
      />
    );
  }

  if (isLoading) {
    return (
      <Row gutter={[24, 24]}>
        <Col span={8}>
          <Card>
            <Skeleton loading active />
          </Card>
        </Col>
      </Row>
    );
  }

  if (videos.length === 0) {
    return (
      <Empty description="You have no video at the moment. Click Upload button to add a new one." />
    );
  }

  return (
    <Row gutter={[24, 24]}>
      {videos.map((video) => (
        <Col key={video.id} span={8}>
          <VideoCard video={video} searchQuery={searchQuery} />
        </Col>
      ))}
    </Row>
  );
}

type VideoCardProps = {
  video: Video;
  searchQuery: string;
};

function VideoCard({
  video: { createdAt, id, status, title, type, url },
  searchQuery,
}: VideoCardProps) {
  const { data, error, isLoading, mutate } = useSWR(
    searchQuery ? `/v1/videos/${id}/segments?q=${searchQuery}` : undefined,
    fetcher
  );
  const [videoCurrentTimeSeconds, setVideoCurrentTimeSeconds] =
    useState<number>(0);
  const videoStartTime = data?.data?.[0]?.start;
  const videoUrl = `${url}#t=${videoCurrentTimeSeconds}`;
  const handleSeekTo = (seekPositionSeconds: number) => {
    setVideoCurrentTimeSeconds(seekPositionSeconds);
  };

  useEffect(() => {
    setVideoCurrentTimeSeconds(videoStartTime);
  }, [videoStartTime]);

  return (
    <Card>
      <video
        key={videoUrl}
        controls
        style={{ width: "100%", paddingBottom: "0.5rem" }}
      >
        <source src={videoUrl} type={type} />
      </video>
      <Meta
        title={title}
        description={
          <Space>
            {formatDistanceToNow(fromUnixTime(createdAt), {
              addSuffix: true,
            })}
            {status !== VideoStatus.TRANSCRIBED && (
              <Tag color={getStatusColor(status)}>{capitalize(status)}</Tag>
            )}
          </Space>
        }
      />
      {searchQuery && (
        <SearchResult
          error={error}
          isLoading={isLoading}
          mutate={mutate}
          segments={data?.data}
          onSeeked={handleSeekTo}
        />
      )}
    </Card>
  );
}

function getStatusColor(videoStatus: VideoStatus): string {
  switch (videoStatus) {
    case VideoStatus.CONVERTING:
    case VideoStatus.CONVERTED:
    case VideoStatus.TRANSCRIBING:
      return "blue";

    default:
      return "";
  }
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

type SearchResultProps = {
  error: any;
  isLoading: boolean;
  mutate: () => void;
  segments: Segment[];
  onSeeked: (seekPositionSeconds: number) => void;
};

function SearchResult({
  error,
  isLoading,
  mutate,
  segments,
  onSeeked,
}: SearchResultProps) {
  if (error) {
    return (
      <Alert
        style={{ marginTop: "0.75rem" }}
        message="Error!"
        type="error"
        description="Failed to get video position."
        action={<Button onClick={() => mutate()}>Reload</Button>}
      />
    );
  }

  if (isLoading) {
    return (
      <div style={{ marginTop: "0.75rem" }}>
        <Skeleton paragraph={false} loading active />
        <Skeleton paragraph={false} loading active />
        <Skeleton paragraph={false} loading active />
      </div>
    );
  }

  return (
    <List
      bordered
      dataSource={segments}
      renderItem={({ start, text }) => (
        <List.Item
          onClick={() => onSeeked(start)}
          style={{ cursor: "pointer" }}
        >
          <Typography.Text>{humanReadableSeekPosition(start)}</Typography.Text>{" "}
          <Typography.Text style={{ marginLeft: "0.5rem", color: "#1677ff" }}>
            {text}
          </Typography.Text>
        </List.Item>
      )}
      style={{ marginTop: "0.75rem" }}
    />
  );
}

function humanReadableSeekPosition(seek: number): string {
  const { days, hours, minutes, months, seconds, weeks, years } =
    intervalToDuration({ start: 0, end: seek * 1000 });
  const sortedUnits = [
    seconds,
    minutes,
    hours,
    days,
    months,
    weeks,
    years,
  ].filter(Boolean);

  if (sortedUnits.length === 0) {
    return "00:00";
  }

  const isSecondOnly = sortedUnits.length === 1;
  const addZeroPrefix = (num: number): string => {
    if (num > 0 && num < 10) {
      return `0${num}`;
    }

    return `${num}`;
  };
  const seekPosition = sortedUnits.reduce((acc, curr, index) => {
    const validUnit = addZeroPrefix(curr || 0);
    const isFirstIndex = index === 0;

    if (isFirstIndex) {
      return `${validUnit}`;
    }

    return `${validUnit}:${acc}`;
  }, "");

  return isSecondOnly ? `00:${seekPosition}` : seekPosition;
}
