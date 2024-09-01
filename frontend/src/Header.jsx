import { Link } from 'react-router-dom';
import odinIcon from './assets/odin-icon.svg';
import './index.css'
import { useAuth } from './authContext';
import { useEffect, useRef, useState } from 'react';
import { FaBars } from "react-icons/fa";

// TODO: handle real user data
export default function Header() {
  const auth = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

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

      <div className='flex gap-4 items-center' ref={dropdownRef}>
        {auth.isAuthenticated ? (
          <div className='relative'>
            <button
              className='py-1 px-2 rounded-lg border border-white'
              onClick={toggleDropdown}
            >
              <FaBars />
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
        ) : (
          <div className='flex gap-4'>
            <Link to={'/login'}>Login</Link>
            <Link to={'/register'}>Register</Link>
          </div>
        )}
      </div>
    </header >);
}