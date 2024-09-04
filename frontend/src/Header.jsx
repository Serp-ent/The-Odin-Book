import { Link } from 'react-router-dom';
import odinIcon from './assets/odin-icon.svg';
import './index.css'
import { useAuth } from './auth/authContext';
import { useEffect, useRef, useState } from 'react';
import { FaBars } from "react-icons/fa";
import { useQuery } from '@tanstack/react-query';
import UserHeader from './components/userHeader';

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

export default function Header() {
  const auth = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const { data: userInfo, isLoading, isError } = useQuery({
    queryKey: ['userInfo', auth.userId],
    queryFn: () => fetchUserInfo(auth.userId),
    enabled: !!auth.userId, // Only run query if userId is available
  });

  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);
  const closeDropdown = () => setIsDropdownOpen(false);

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

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <header
      className='p-2 bg-gray-900 flex items-center justify-between text-white'
    >
      <div>
        <Link
          className='flex justify-start items-center gap-1'
          href='/'>
          <img src={odinIcon} className='w-1/6 h-auto' />
          <h1 className='font-bold'>The Odin Book</h1>
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
                <div className='border p-2 absolute right-0 mt-2 w-48 bg-gray-900 rounded-lg shadow-lg z-50'>
                  <ul className='py-2 flex flex-col gap-2'>
                    <li>
                      <Link
                        className='block p-1 test-white hover:bg-gray-800'
                        onClick={closeDropdown}
                        to={`/profile/${auth.userId}`}
                      >
                        Profile</Link>
                    </li>
                    <hr></hr>
                    <Link to={'/users'}
                      className='block p-1 test-white hover:bg-gray-800'>
                      Find Friends
                    </Link>
                    <hr></hr>
                    <Link to={'/users/followed'}
                      className='block p-1 test-white hover:bg-gray-800'>
                      Following
                    </Link>
                    <hr></hr>
                    <li>
                      <Link
                        className='block p-1 test-white hover:bg-gray-800'
                        to={`/profile/settings`}
                      >
                        Settings</Link>
                    </li>
                    <hr></hr>
                    <li>
                      <button
                        className='block p-1 test-white hover:bg-gray-800'
                        onClick={() => {
                          auth.logout()
                          closeDropdown();
                        }}
                      >
                        Log out
                      </button>
                    </li>
                  </ul>

                </div>
              )}
            </div>
          </>
        ) : (
          <div className='flex gap-4'>
            <Link to={'/login'}>Login</Link>
            <Link to={'/register'}>Register</Link>
          </div>
        )}
      </div>
    </header >);
}