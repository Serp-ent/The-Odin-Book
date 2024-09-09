import { Outlet } from 'react-router-dom';
import Header from '../Header';
import '../index.css'
import { useAuth } from '../auth/authContext';
import FollowedUsers from '../routes/followedUsers';
import FindFriends from '../routes/findFriends';

// TODO: add removing posts function
// TODO: add loading spinner for every component
function Layout() {
  const auth = useAuth();

  return (
    <div className={`h-screen grid grid-rows-[auto_1fr] ${auth.isAuthenticated ? 'lg:grid-cols-[2fr_1fr] xl:grid-cols-[1fr_3fr_1fr]' : 'grid-cols-1'}`} >
      <Header />
      {auth.isAuthenticated &&
        <FindFriends className='hidden xl:flex' />
      }

      <Outlet />

      {auth.isAuthenticated &&
        <FollowedUsers className='hidden lg:flex' />
      }
    </div>
  );
}

export default Layout
