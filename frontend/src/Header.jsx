import { Link } from 'react-router-dom';
import odinIcon from './assets/odin-icon.svg';
import './index.css'
import { useAuth } from './auth/authContext';
import { useEffect, useRef, useState } from 'react';
import { FaBars, FaMoon, FaSun } from 'react-icons/fa';
import { useQuery } from '@tanstack/react-query';
import UserHeader from './components/userHeader';
import LanguageSelector from './components/languageSelector';
import { useTranslation } from 'react-i18next';

const fetchUserInfo = async (userId) => {
  const response = await fetch(`http://localhost:3000/api/users/${userId}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('authToken')}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch user info');
  }

  return response.json();
};

// TODO: highlight current route in popup
// TODO: on very narrow screens hide The Odin Book title
export default function Header() {
  const auth = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const [isDarkMode, setIsDarkMode] = useState(() => {
    const storedTheme = localStorage.getItem('theme');
    return storedTheme === 'dark' || (!storedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches);
  })

  const { data: userInfo, isLoading, isError } = useQuery({
    queryKey: ['userInfo', auth.userId],
    queryFn: () => fetchUserInfo(auth.userId),
    enabled: !!auth.userId, // Only run query if userId is available
  });

  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);
  const closeDropdown = () => setIsDropdownOpen(false);
  const toggleDarkMode = () => {
    const newTheme = isDarkMode ? 'light' : 'dark';
    setIsDarkMode(!isDarkMode);
    localStorage.setItem('theme', newTheme);
  }

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        closeDropdown();
      }
    }

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode])

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <header
      className='p-2 bg-background-light text-text-primary-light dark:text-text-primary-dark dark:bg-background-dark flex items-center justify-between'
    >
      <div>
        <Link
          className='flex justify-start items-center gap-1'
          href='/'>
          <img src={odinIcon}
            className='w-1/6 h-auto' />
          <h1 className='font-bold'>
            The Odin Book
          </h1>
        </Link>
      </div>

      <div className='flex gap-1 items-center' ref={dropdownRef}>
        {auth.isAuthenticated ? (
          <>
            <UserHeader user={userInfo} size='small' />
            <div className='relative'>
              <button
                className='py-1 px-2'
                onClick={toggleDropdown}
              >
                <FaBars size={"24px"} />
              </button>

              {isDropdownOpen && (
                <div className='border p-2 absolute right-0 mt-2 w-48 bg-background-light text-text-primary-light dark:bg-background-dark dark:text-text-primary-dark rounded-lg shadow-lg z-50'>
                  <ul className='py-2 flex flex-col gap-2'>
                    <li>
                      <Link
                        className='block p-1 test-white dark:hover:bg-gray-800 hover:bg-gray-200'
                        onClick={closeDropdown}
                        to={`/profile/${auth.userId}`}
                      >
                        Profile</Link>
                    </li>
                    <hr></hr>
                    <Link to={'/users'}
                      className='block p-1 test-white dark:hover:bg-gray-800 hover:bg-gray-200'>
                      Find Friends
                    </Link>
                    <hr></hr>
                    <Link to={'/users/followed'}
                      className='block p-1 test-white dark:hover:bg-gray-800 hover:bg-gray-200'>
                      Following
                    </Link>
                    <hr></hr>
                    <li>
                      <Link
                        className='block p-1 test-white hover:bg-gray-200 dark:hover:bg-gray-800'
                        to={`/profile/settings`}
                      >
                        Settings</Link>
                    </li>
                    <hr></hr>
                    <li className='hover:bg-gray-200 dark:hover:bg-gray-800'>
                      <button
                        className='block p-1 test-white '
                        onClick={() => {
                          auth.logout()
                          closeDropdown();
                        }}
                      >
                        Log out
                      </button>
                    </li>
                  </ul>

                  <div className='flex justify-between items-center bg-background-light text-text-primary-light dark:bg-background-dark dark:text-text-primary-dark'>
                    <LanguageSelector />

                    <div className='flex justify-end'>
                      <button onClick={toggleDarkMode} className="ml-4 p-2 rounded">
                        {isDarkMode ? <FaSun size={20} /> : <FaMoon size={20} />}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className='flex gap-2 items-center justify-end text-sm'>
            <Link to={'/login'}>Login</Link>
            <Link to={'/register'}>Register</Link>
            <LanguageSelector size='small' />
            <button onClick={toggleDarkMode} className="rounded">
              {isDarkMode ? <FaSun size={20} /> : <FaMoon size={20} />}
            </button>
          </div>
        )}

      </div>
    </header >
  );
}