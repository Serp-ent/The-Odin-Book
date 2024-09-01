import { useFetcher } from "react-router-dom";

export default function createPost() {
  const fetcher = useFetcher();

  return (
    <fetcher.Form className="bg-gray-800 text-white border-2 rounded m-2 p-2 border-gray-500 flex flex-col gap-1"
      action="/post" method="POST">
      <input className="border bg-gray-800 p-1 rounded"
        placeholder="How do you feel?"
        name="content"
      />
      <div className="flex justify-end">
        <button className="border-2 border-gray-500 rounded py-1 text-sm px-2"
          type="submit">
          Publish</button>
      </div>
    </fetcher.Form>
  );

}