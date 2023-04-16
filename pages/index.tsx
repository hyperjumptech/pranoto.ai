import Layout from "@/components/layout";
import { CalendarIcon } from "@heroicons/react/20/solid";

const people = [
  {
    name: "Fri Mar 24 2023 10:17:04 am",
    role: "Fri Mar 24 2023 10:17:04 am",
    imageUrl:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=8&w=1024&h=1024&q=80",
   },
  {
    name: "Fri Mar 24 2023 10:17:04 am",
    role: "Fri Mar 24 2023 10:17:04 am",
    imageUrl:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=8&w=1024&h=1024&q=80",
   },
  {
    name: "Fri Mar 24 2023 10:17:04 am",
    role: "Fri Mar 24 2023 10:17:04 am",
    imageUrl:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=8&w=1024&h=1024&q=80",
   },
  {
    name: "Fri Mar 24 2023 10:17:04 am",
    role: "Fri Mar 24 2023 10:17:04 am",
    imageUrl:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=8&w=1024&h=1024&q=80",
   },
];

export default function Home() {
  return (
    <>
      <Layout>
        <div className="mx-auto max-w-7xl">
          <h2 className="font-bold tracking-tight text-gray-900">
            Videos
          </h2>
          <ul
            role="list"
            className="mx-auto mt-4 grid max-w-2xl grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2 lg:mx-0 lg:max-w-none lg:grid-cols-3"
          >
            {people.map((person) => (
              <li key={person.name}>
                <img
                  className="aspect-[3/2] w-full rounded-2xl object-cover"
                  src={person.imageUrl}
                  alt=""
                />
                <h3 className="mt-2 text-lg font-semibold tracking-tight text-gray-900">
                  {person.name}
                </h3>
                <p className="text-sm text-gray-600 flex">
                  <CalendarIcon className="h-4 w-4 mr-2 mt-0.5" aria-hidden="true" />
                  {person.role}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </Layout>
    </>
  );
}
