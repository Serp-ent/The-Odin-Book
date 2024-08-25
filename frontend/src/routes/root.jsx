import { Outlet } from 'react-router-dom';
import Aside from '../Aside';
import Header from '../Header';
import '../index.css'

function Root() {
  return (
    <div
      className='h-screen grid grid-rows-[auto_10fr] grid-cols-[5fr_2fr]'
    >
      <Header />
      <Outlet />
      <Aside />
    </div>
  );
}

export default Root
