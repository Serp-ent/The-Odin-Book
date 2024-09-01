import { useFetcher } from "react-router-dom";

export default function CommentInput() {
  const fetcher = useFetcher();
  // TODO: currently adding new comment requires page reload
  // to see posted comment
  return (
    <fetcher.Form className="flex gap-1" action="comment" method="POST">
      <input
        className="border bg-gray-800 p-1 rounded grow"
        name="content"
        placeholder="comment now..."></input>
      <button className="rounded border bg-gray-900 p-1">Post</button>
    </fetcher.Form>
  );
}