import { useState } from "react";
import { useFetcher } from "react-router-dom";

// TODO: invoke refetch of posts
export default function CreatePost() {
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

    const formDataToObject = (formData) => {
      const obj = {};
      formData.forEach((value, key) => {
        if (obj[key]) {
          // If the key already exists in the object, convert it to an array and add the new value
          obj[key] = [].concat(obj[key], value);
        } else {
          // Otherwise, just set the value
          obj[key] = value;
        }
      });
      return obj;
    };

    console.log(formDataToObject(submissionData));

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

      // Handle successful post creation (e.g., notify user or redirect)
      console.log('Post created successfully');
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  return (
    <form
      className="bg-gray-800 text-white border-2 rounded m-2 p-2 border-gray-500 flex flex-col gap-1"
      onSubmit={handleSubmit}
      encType="multipart/form-data"
    >
      <textarea
        className="border bg-gray-800 p-1 rounded text-sm overflow-y-hidden"
        placeholder="How do you feel?"
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
        <button className="border-2 border-gray-500 rounded py-1 text-sm px-2" type="submit">
          Publish
        </button>
      </div>
    </form>
  );
}