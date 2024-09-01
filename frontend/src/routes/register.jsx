import { useState } from "react";
import { useAuth } from "../authContext";
import { Link, useNavigate } from "react-router-dom";

// TODO: user should be able to provide image that he want to use
export default function Register() {
  const [formData, setFormData] = useState({
    username: '', email: '', password: '',
    firstName: '', lastName: '', confirmPassword: '',
  });

  const [error, setError] = useState('');

  const auth = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log(formData);
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevFormData => ({
      ...prevFormData,
      [name]: value,
    }));
  }

  // TODO: responsive form on smaller screens
  return (
    <main
      className='text-white p-4 flex flex-col items-center'
    >
      <form
        onSubmit={handleSubmit}
        className='border-2 p-4 flex flex-col gap-2 rounded shadow border-gray-700'
        method="POST"
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
            className="border px-4 py-2 rounded"
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