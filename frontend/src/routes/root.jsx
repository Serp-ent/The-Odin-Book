import { Outlet } from 'react-router-dom';
import Aside from '../Aside';
import Header from '../Header';
import '../index.css'
import { useAuth } from '../authContext';

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
            <Aside />
          </>
        ) : (
          <Outlet></Outlet>
        )

      }
    </div >
  );
}

export default Root
