import Root from './root';
import ErrorPage from './error-page';
import Posts, { loader as postLoader } from './Posts';
import Profile, { loader as ProfileLoader } from './Profile';
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
        errorElement: <ErrorPage />,
        children: [
          {
            index: true,
            element: <ProtectedRoute element={<Posts />} />,
            loader: postLoader
          },
          {
            path: '/profile/:id',
            element: <ProtectedRoute element={<Profile />} />,
            loader: ProfileLoader,
          },
          {
            path: '/login',
            element: <Login />,
          },
          {
            path: '/register',
            element: <Register />,
          }
        ]
      },
    ],
  },
]

export default routes;