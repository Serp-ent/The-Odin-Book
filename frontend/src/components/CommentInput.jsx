import { useState } from "react";
import { useFetcher } from "react-router-dom";
import { FaRegPaperPlane } from "react-icons/fa";
import { useTranslation } from "react-i18next";

export default function CommentInput({ onSubmit }) {
  const fetcher = useFetcher();
  const { t, ready } = useTranslation('post');

  const [content, setContent] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const handleSubmit = (event) => {
    event.preventDefault();

    onSubmit(content);
    setContent('');
    setShowPopup(true);

    const textarea = event.target.querySelector('textarea');
    textarea.style.height = 'auto';

    setTimeout(() => {
      setShowPopup(false);
    }, 3000)
  };

  const handleClosePopup = () => {
    setShowPopup(false);
  }

  const handleInputChange = (e) => {
    setContent(e.target.value);

    e.target.style.height = 'auto';
    e.target.style.height = `${e.target.scrollHeight}px`;
  }

  if (!ready) {
    return <div>Loading Translation...</div>
  }

  return (
    <>
      <fetcher.Form
        className="flex gap-1 items-end"
        action="comment"
        method="POST"
        onSubmit={handleSubmit}
      >
        <textarea
          className="border text-xs dark:bg-gray-800 p-1 rounded grow overflow-y-hidden resize-none"
          name="content"
          placeholder={t('commentNow')}
          value={content}
          onChange={handleInputChange}
          rows={1}
        />

        <button className="rounded border dark:bg-gray-900 p-1">
          <FaRegPaperPlane />
        </button>
      </fetcher.Form>

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