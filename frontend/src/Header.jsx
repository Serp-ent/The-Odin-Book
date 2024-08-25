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
        <Link to={'/profile'}>
          Ben Thomson
        </Link>
        <button
          className='py-2 px-4 rounded-lg border-2 border-white'
          onClick={auth.logout}
        >Log out</button>
      </div>
    </header>);
}