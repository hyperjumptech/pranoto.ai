import Layout from "@/components/layout";
import { VideoCameraIcon } from "@heroicons/react/20/solid";

export default function Create() {
  return (
    <>
      <Layout>
        <div className="col-span-full">
          <label
            htmlFor="cover-photo"
            className="block text-sm font-medium leading-6 text-gray-900"
          >
            Upload video
          </label>
          <div className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10">
            <div className="text-center">
              <VideoCameraIcon
                className="mx-auto h-12 w-12 text-gray-300"
                aria-hidden="true"
              />
              <div className="mt-4 flex text-sm leading-6 text-gray-600">
                <label
                  htmlFor="file-upload"
                  className="relative cursor-pointer rounded-md bg-white font-semibold text-indigo-600 hover:text-indigo-500"
                >
                  <span className="rounded-md bg-indigo-600 px-2.5 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500">
                    Upload a file
                  </span>
                  <input
                    id="file-upload"
                    name="file-upload"
                    type="file"
                    className="sr-only"
                    accept="video/mp4"
                  />
                </label>
              </div>
              <p className="text-xs leading-5 text-gray-600">MP4 up to 10MB</p>
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
}
