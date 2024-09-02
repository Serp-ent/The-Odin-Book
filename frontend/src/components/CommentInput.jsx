import { useState } from "react";
import { useFetcher } from "react-router-dom";

export default function CommentInput({ onSubmit }) {
  const fetcher = useFetcher();

  const [content, setContent] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  // TODO: currently adding new comment requires page reload
  // to see posted comment

  // TODO: add some kind of popup that comment was added
  const handleSubmit = (event) => {
    event.preventDefault();

    onSubmit(content);
    setContent('');
    setShowPopup(true);

    // TODO: allow user to close popup faster 
    setTimeout(() => {
      setShowPopup(false);
    }, 3000)
  };

  const handleClosePopup = () => {
    setShowPopup(false);
  }

  return (
    <>
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

      {/* TODO: add animation of disappearing and showing up */}
      {/* // TODO: maybe some circle that show how much time is left */}
      {showPopup && (
        <div className="fixed bottom-5 right-5 p-2 bg-green-500 text-white rounded shadow-lg flex items-center">
          <span className="mr-2">Comment added!</span>
          <button
            className="bg-transparent text-white border-0 font-semibold cursor-pointer font-xl"
            onClick={handleClosePopup}
          >
            &times;
          </button>
        </div>
      )}
    </>
  );
}