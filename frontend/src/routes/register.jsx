import { useState } from "react";
import { useAuth } from "../auth/authContext";
import { Link, useNavigate } from "react-router-dom";

// TODO: user should be able to provide image that he want to use
// TODO: fix registration
// TODO: add live form validation with red/green borders

export default function Register() {
  const [formData, setFormData] = useState({
    username: '', email: '', password: '',
    firstName: '', lastName: '', confirmPassword: '',
    profilePic: null,
  });

  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formDataToSend = new FormData();
    formDataToSend.append('username', formData.username);
    formDataToSend.append('email', formData.email);
    formDataToSend.append('password', formData.password);
    formDataToSend.append('passwordConfirm', formData.confirmPassword);
    formDataToSend.append('firstName', formData.firstName);
    formDataToSend.append('lastName', formData.lastName);
    formDataToSend.append('profilePic', formData.profilePic); // This is the file


    try {
      const response = await fetch('http://localhost:3000/register', {
        method: "POST",
        body: formDataToSend,
      })

      const result = await response.json();
      console.log('response:', result);
    } catch (err) {
      console.error(err);
    }

  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevFormData => ({
      ...prevFormData,
      [name]: value,
    }));
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    console.log('file:', file);

    setFormData(prevFormData => ({
      ...prevFormData,
      profilePic: file,
    }));
  };


  return (
    <main
      className='text-white p-4 flex flex-col items-center'
    >
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

        <div className="flex flex-col">
          <label>Profile Picture</label>
          <input
            className="text-xs border bg-gray-800 p-1 rounded"
            name="profilePic"
            type="file"
            onChange={handleFileChange}
          />
        </div>


        <div className="flex flex-col">
          <label>Password</label>
          <input
            className="border bg-gray-800 p-1 rounded"
            name="password"
            value={formData.password}
            onChange={handleChange}
          />
        </div>
        <div className="flex flex-col">
          <label>Confirm Password</label>
          <input
            className="border bg-gray-800 p-1 rounded"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
          />
        </div>

        {error &&
          <p
            className="text-red-500">
            {error}
          </p>
        }

        <div className="flex justify-end">
          <button
            className="border px-2 py-1 rounded"
            type="submit"
          >Register</button>
        </div>

      </form>

      <div className="flex justify-center mt-4 text-sm">
        <p>
          Already have an account?{' '}
          <Link
            to='/login'
            className="text-blue-400 underline"
          >
            Login here
          </Link>.
        </p>
      </div>
    </main>
  );
}