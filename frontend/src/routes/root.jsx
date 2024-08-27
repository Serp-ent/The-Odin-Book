import { Outlet } from 'react-router-dom';
import Header from '../Header';
import '../index.css'
import { useAuth } from '../authContext';
import FollowedUsers from '../followedUsers';

function Root() {
  const auth = useAuth();

  return (
    <div
      className={`h-screen grid grid-rows-[auto_10fr] 
      ${auth.isAuthenticated ? 'grid-cols-[5fr_2fr]' : 'grid-cols-1'}`}
    >
      <Header />
      {
        auth.isAuthenticated ? (
          <>
            <Outlet />
            <FollowedUsers />
          </>
        ) : (
          <Outlet></Outlet>
        )

      }
    </div >
  );
}

export default Root
