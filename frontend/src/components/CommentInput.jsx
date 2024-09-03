import { useState } from "react";
import { useFetcher } from "react-router-dom";
import { FaRegPaperPlane } from "react-icons/fa";

export default function CommentInput({ onSubmit }) {
  const fetcher = useFetcher();

  const [content, setContent] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const handleSubmit = (event) => {
    event.preventDefault();

    onSubmit(content);
    setContent('');
    setShowPopup(true);

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
        {/* TODO: change to text area */}
        {/* TODO: when user creates comment he don't see it while limiting */}
        <input
          className="border text-xs bg-gray-800 p-1 rounded grow"
          name="content"
          placeholder="comment now..."
          value={content}
          onChange={e => setContent(e.target.value)}
        />

        <button className="rounded border bg-gray-900 p-1">
          <FaRegPaperPlane color="white" />
        </button>
      </fetcher.Form>

      {/* TODO: add options for receiving sorted comments by top likes, and oldest */}
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