import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/authContext";
import { useTranslation } from "react-i18next";

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { t, ready } = useTranslation('header');

  const auth = useAuth();
  const navigate = useNavigate();

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

  if (!ready) {
    return <div>Loading Translation...</div>
  }

  return (
    <main
      className='p-4 flex flex-col items-center container mx-auto sm:w-[500px] '
    >
      <form
        onSubmit={handleSubmit}
        className='border-2 p-4 w-full flex flex-col gap-2 rounded shadow border-gray-700'
        method="POST"
      >
        <div className="flex flex-col">
          <label>{t('username')}</label>
          <input
            className='border border-gray-900 dark:border-background-light dark:bg-gray-800 p-1 rounded'
            name="username"
            value={username}
            onChange={e => setUsername(e.target.value)}
          />
        </div>
        <div className="flex flex-col">
          <label>{t('password')}</label>
          <input
            className='border border-gray-900 dark:border-background-light dark:bg-gray-800 p-1 rounded'
            type="password"
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
            className="border border-gray-600 px-4 py-2 rounded"
            type="submit"
          >{t('login')}</button>
        </div>

      </form>

      <div className="flex justify-center mt-4 text-sm">
        <p>
          {t('noAccountQuestion')}{' '}
          <Link
            to='/register'
            className="text-accent-light dark:text-accent-dark underline"
          >
            {t('register')}
          </Link>
        </p>
      </div>
    </main>
  );
}