import Root from './root';
import ErrorPage from './error-page';
import Posts, { loader as postLoader } from './Posts';
import Profile from './Profile';
import Login from './login';
import ProtectedRoute from '../protectedRoute';
import Register from './register';

const routes = [
  {
    path: '/',
    element: <Root />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <ProtectedRoute element={<Posts />} />,
        loader: postLoader
      },
      {
        path: '/profile',
        element: <ProtectedRoute element={<Profile />} />
      },
      {
        path: '/login',
        element: <Login />,
      },
      {
        path: '/register',
        element: <Register />,
      }
    ],
  },
]

export default routes;