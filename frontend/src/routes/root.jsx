import { Outlet } from 'react-router-dom';
import Header from '../Header';
import '../index.css'
import { useAuth } from '../authContext';
import FollowedUsers from '../followedUsers';

function Root() {
  return (
    <div className={`h-screen grid grid-rows-[auto_10fr]`} >
      <Header />
      <Outlet />
    </div >
  );
}

export default Root
