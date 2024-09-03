import { useState } from "react";
import { useFetcher } from "react-router-dom";

export default function CreatePost() {
  const fetcher = useFetcher();

  const [content, setContent] = useState('');

  const handleChange = (e) => {
    setContent(e.target.value);

    e.target.style.height = 'auto';
    e.target.style.height = `${e.target.scrollHeight}px`;
  }

  const handleSubmit = (e) => {
    e.preventDefault();

    fetcher.submit(e.target, { method: "POST" });

    setContent('');
    // Wait for the next render cycle to update the textarea height
    setTimeout(() => {
      const textarea = e.target.querySelector('textarea');
      if (textarea) {
        textarea.style.height = 'auto'; // Reset to single row
      }
    }, 0);
  }

  return (
    <fetcher.Form
      className="bg-gray-800 text-white border-2 rounded m-2 p-2 border-gray-500 flex flex-col gap-1"
      onSubmit={handleSubmit}
      action="/post" method="POST">
      <textarea
        className="border bg-gray-800 p-1 rounded text-sm overflow-y-hidden"
        placeholder="How do you feel?"
        name="content"
        value={content}
        onChange={handleChange}
        rows={1}
      />
      <div className="flex justify-end">
        <button className="border-2 border-gray-500 rounded py-1 text-sm px-2"
          type="submit">
          Publish</button>
      </div>
    </fetcher.Form>
  );

}