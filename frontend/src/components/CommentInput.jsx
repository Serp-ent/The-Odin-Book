import { useState } from "react";
import { useFetcher } from "react-router-dom";

export default function CommentInput({onSubmit}) {
  const fetcher = useFetcher();

  const [content, setContent] = useState('');
  // TODO: currently adding new comment requires page reload
  // to see posted comment

  // TODO: add some kind of popup that comment was added
  const handleSubmit = (event) => {
    event.preventDefault();

    onSubmit(content);
    setContent('');
  };

  return (
    <fetcher.Form
      className="flex gap-1"
      action="comment"
      method="POST"
      onSubmit={handleSubmit}
    >
      <input
        className="border bg-gray-800 p-1 rounded grow"
        name="content"
        placeholder="comment now..."
        value={content}
        onChange={e => setContent(e.target.value)}
      />

      <button className="rounded border bg-gray-900 p-1">Post</button>
    </fetcher.Form>
  );
}