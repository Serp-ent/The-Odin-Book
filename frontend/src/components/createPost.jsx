import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useFetcher } from "react-router-dom";

export default function CreatePost() {
  const queryClient = useQueryClient();
  const { t, ready } = useTranslation('post');
  // State to manage form data including content and images
  const [formData, setFormData] = useState({
    content: '',
    images: [], // To store selected images
  });

  const handleChange = (e) => {
    // Update content in formData
    setFormData(prev => ({
      ...prev,
      content: e.target.value
    }));

    // Auto-resize textarea
    e.target.style.height = 'auto';
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  const handleFileChange = (e) => {
    // Update images in formData
    setFormData(prev => ({
      ...prev,
      images: Array.from(e.target.files) // Convert FileList to array
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prepare FormData for submission
    const submissionData = new FormData();
    submissionData.append('content', formData.content);

    // Append multiple images to FormData
    formData.images.forEach((image) => {
      submissionData.append('images', image); // Use the same name 'images' for multiple files
    });

    // Reset form data after submission
    setFormData({ content: '', images: [] });

    // Reset textarea height after form submission
    setTimeout(() => {
      const textarea = e.target.querySelector('textarea');
      if (textarea) {
        textarea.style.height = 'auto'; // Reset to single row
      }
    }, 0);

    try {
      // Send the request
      const response = await fetch('http://localhost:3000/api/posts', {
        method: 'POST',
        body: submissionData,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to create post');
      }

      queryClient.invalidateQueries('posts');
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  if (!ready) {
    return <div>Loading Translation...</div>
  }

  return (
    <form
      className="bg-background-light text-text-primary-light dark:bg-background-dark dark:text-text-primary-dark border-2 rounded m-2 p-2 border-gray-500 flex flex-col gap-1"
      onSubmit={handleSubmit}
      encType="multipart/form-data"
    >
      <textarea
        className="bg-gray-200 dark:text-white dark:bg-gray-800 border p-1 rounded text-sm overflow-y-hidden resize-none"
        placeholder={t('moodQuestion')}
        name="content"
        value={formData.content}
        onChange={handleChange}
        rows={1}
      />
      <input
        className="text-xs"
        type="file"
        name="images"
        multiple
        onChange={handleFileChange}
      />
      <div className="flex justify-end">
        <button className="border border-gray-500 rounded text-sm py-1 px-2" type="submit">
          {t('createPost')}
        </button>
      </div>
    </form>
  );
}