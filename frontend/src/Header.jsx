import { Link } from 'react-router-dom';
import odinIcon from './assets/odin-icon.svg';
import './index.css'
import { useAuth } from './authContext';

export default function Header() {
  const auth = useAuth();
  return (
    <header
      className='py-2 px-4 bg-gray-900 col-span-2 flex items-center justify-between text-white'
    >
      <div>
        <Link
          className='flex justify-center items-center gap-4'
          href='/'>
          <img src={odinIcon} />
          <h1 className='font-bold text-3xl'>The Odin Book</h1>
        </Link>
      </div>

      <div className='flex gap-4 items-center'>
        {auth.isAuthenticated ? (
          <>
            <Link to={'/profile'} className='flex items-center gap-2'>
              {/* TODO: avatar */}
              <div className='w-10 h-10 rounded-full bg-white'></div>
              Ben Thomson
            </Link>
            <button
              className='py-2 px-4 rounded-lg border-2 border-white'
              onClick={auth.logout}
            >Log out</button>
          </>
        ) : (
          <div className='flex gap-4'>
            <Link to={'/login'}>Login</Link>
            <Link to={'/register'}>Register</Link>
          </div>
        )}
      </div>
    </header>);
}