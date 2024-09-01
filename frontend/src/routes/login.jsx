import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../authContext";

// TODO: add links if user don't have already account
// TODO: prevent user accessing login and register when logged in
export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const auth = useAuth();
  const navigate = useNavigate();

  // TODO: this should be in wrapper instead of useEffect
  useEffect(() => {
    // Redirect to home page if user is authenticated
    if (auth.isAuthenticated) {
      navigate('/');
    }
  }, [auth.isAuthenticated, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault();

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

    if (!response.ok) {
      setError('Invalid username or password');
      return;
    }

    const result = await response.json();
    auth.login(result.token);
    navigate('/');
  }

  // TODO: responsive form on smaller screens
  return (
    <main
      className='bg-gray-700 text-white p-4 flex flex-col items-center'
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

      <div className="flex justify-center mt-4 text-sm">
        <p>
          Don&apos;t have an account?{' '}
          <Link
            to='/register'
            className="text-blue-400 underline"
          >
            Register here
          </Link>
        </p>
      </div>
    </main>
  );
}