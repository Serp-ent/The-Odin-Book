import { Outlet } from 'react-router-dom';
import Header from '../Header';
import '../index.css'
import { useAuth } from '../auth/authContext';
import FollowedUsers from '../routes/followedUsers';
import FindFriends from '../routes/findFriends';

function Layout() {
  return (
    <div className={`h-screen grid grid-rows-[auto_1fr] lg:grid-cols-[2fr_1fr] xl:grid-cols-[1fr_3fr_1fr]`} >
      <Header />
      <div className='h-full hidden xl:block xl:col-start-1'>
        <FindFriends />
      </div>

      <Outlet />

      <div className='h-full hidden lg:block'>
        <FollowedUsers />
      </div>
    </div>
  );
}

export default Layout
