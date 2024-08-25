import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../authContext";

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const auth = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log({
      username,
      password,
    })

    // TODO: handle server response
    if (!username || !password) {
      setError('Username and password are required');
      return;
    }

    if (username === 'user' && password === 'pass') {
      auth.login();
      navigate('/');
    } else {
      setError('Invalid username or password');
    }
  }

  // TODO: responsive form on smaller screens
  return (
    <main
      className='h-screen flex justify-center items-center'
    >
      <form
        onSubmit={handleSubmit}
        className='border p-4 flex flex-col gap-2 rounded shadow'
        method="POST"
      >
        <div className="flex flex-col">
          <label>Username</label>
          <input
            className="border"
            name="username"
            value={username}
            onChange={e => setUsername(e.target.value)}
          />
        </div>
        <div className="flex flex-col">
          <label>Password</label>
          <input
            className='border'
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