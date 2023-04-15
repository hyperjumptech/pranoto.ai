import axios from "axios";

const second = 1000;
const byte = 1000;
const MB = 1000 * byte;
const axiosInstance = axios.create({
  baseURL: "/api",
  maxContentLength: 1 * MB,
  maxRedirects: 5,
  timeout: 5 * second,
});

export async function fetcher(url: string) {
  return axiosInstance.get(url).then((res) => res.data);
}
