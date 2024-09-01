import { Outlet } from 'react-router-dom';
import Header from '../Header';
import '../index.css'
import { useAuth } from '../auth/authContext';
import FollowedUsers from '../routes/followedUsers';

function Layout() {
  return (
    <div className={`h-screen grid grid-rows-[auto_10fr]`} >
      <Header />
      <Outlet />
    </div >
  );
}

export default Layout
