import { useEffect, useReducer, useRef, useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/authContext';

const fetchUserProfile = async (userId) => {
  const response = await fetch(`http://localhost:3000/api/users/${userId}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('authToken')}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to load user profile');
  }

  return response.json();
};

const updateProfile = async (data) => {
  const response = await fetch(`http://localhost:3000/api/users/${data.userId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('authToken')}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Failed to update profile');
  }

  return response.json();
};

export default function EditProfile() {
  const auth = useAuth();
  const navigate = useNavigate();
  const bioRef = useRef(null);
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    username: '',
    bio: '',
    // profilePic: null,
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (bioRef.current) {
      bioRef.current.style.height = 'auto';
      bioRef.current.style.height = `${bioRef.current.scrollHeight}px`;
    }
  }, [formData.bio])

  // TODO: add uploading new file
  // TODO: add spinner
  const { data: userProfile } = useQuery({
    queryKey: ['user', auth.userId],
    queryFn: async () => {
      const data = await fetchUserProfile(auth.userId);

      setFormData({
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        username: data.username,
        bio: data.bio || '',
        // profilePic: data.profilePic || null,
        password: '',
        confirmPassword: '',
      });

      return data;
    }
  });

  const mutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      navigate(`/profile/${auth.userId}`);
    },
    onError: (error) => {
      setError(error.message);
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFormData(prev => ({ ...prev, profilePic: e.target.files[0] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { profilePic, ...rest } = formData;

    let profilePicUrl = '';
    if (profilePic) {
      const formData = new FormData();
      formData.append('profilePic', profilePic);
      const uploadResponse = await fetch('http://localhost:3000/api/upload', {
        method: 'POST',
        body: formData,
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken')}`,
        },
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload profile picture');
      }

      const uploadResult = await uploadResponse.json();
      profilePicUrl = uploadResult.url; // Adjust based on your API response
    }

    mutation.mutate({ ...rest, userId: auth.userId, profilePic: profilePicUrl });
  };

  return (
    <main className='text-white p-4 flex flex-col items-center'>
      <form
        onSubmit={handleSubmit}
        className='border-2 p-4 flex flex-col gap-2 rounded shadow border-gray-700'
        method="POST"
        encType="multipart/form-data"
      >
        <div className="flex flex-col">
          <label>First Name</label>
          <input
            className="border bg-gray-800 p-1 rounded"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
          />
        </div>
        <div className="flex flex-col">
          <label>Last Name</label>
          <input
            className="border bg-gray-800 p-1 rounded"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
          />
        </div>
        <div className="flex flex-col">
          <label>Username</label>
          <input
            className="border bg-gray-800 p-1 rounded"
            name="username"
            value={formData.username}
            onChange={handleChange}
          />
        </div>
        <div className="flex flex-col">
          <label>Email</label>
          <input
            className="border bg-gray-800 p-1 rounded"
            name="email"
            value={formData.email}
            onChange={handleChange}
          />
        </div>

        {/* // TODO */}
        {/* <div className="flex flex-col">
          <label>Profile Picture</label>
          <input
            className="text-xs border bg-gray-800 p-1 rounded"
            name="profilePic"
            type="file"
            onChange={handleFileChange}
          />
        </div> */}

        <div className="flex flex-col">
          <label>Bio</label>
          <textarea
            ref={bioRef}
            className="border bg-gray-800 p-1 rounded overflow-hidden resize-none"
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            rows={1}
          />
        </div>

        {/* // TODO: add ability to change password
        <div className="flex flex-col">
          <label>Password</label>
          <input
            className="border bg-gray-800 p-1 rounded"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
          />
        </div>
        <div className="flex flex-col">
          <label>Confirm Password</label>
          <input
            className="border bg-gray-800 p-1 rounded"
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange}
          />
        </div> */}

        {error &&
          <p className="text-red-500">
            {error}
          </p>
        }

        <div className="flex justify-end">
          <button
            className="border px-2 py-1 rounded bg-blue-500 text-white"
            type="submit"
          >
            Save Changes
          </button>
        </div>

      </form>

      <div className="flex justify-center mt-4 text-sm">
        <p>
          <button
            className="text-blue-400 underline"
            onClick={() => navigate(-1)}
          >
            Back
          </button>
        </p>
      </div>
    </main>
  );
}