import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../authContext";

// TODO: add links if user don't have already account
export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const auth = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // TODO: handle server response
    if (!username || !password) {
      setError('Username and password are required');
      return;
    }

    const response = await fetch(`http://localhost:3000/login`, {
      method: "POST",
      headers: {
        'Content-Type': "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    const result = await response.json();
    if (response.ok && result.status === 'success') {
      auth.login();
      navigate('/');
    } else {
      setError('Invalid username or password');
    }
  }

  // TODO: responsive form on smaller screens
  return (
    <main
      className='bg-gray-700 text-white pt-20 flex justify-center items-start'
    >
      <form
        onSubmit={handleSubmit}
        className='border-2 p-4 flex flex-col gap-2 rounded shadow border-gray-800'
        method="POST"
      >
        <div className="flex flex-col">
          <label>Username</label>
          <input
            className="border bg-gray-800 p-1 rounded"
            name="username"
            value={username}
            onChange={e => setUsername(e.target.value)}
          />
        </div>
        <div className="flex flex-col">
          <label>Password</label>
          <input
            className="border bg-gray-800 p-1 rounded"
            name="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
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
          >Login</button>
        </div>
      </form>
    </main>
  );
}