import Root from './root';
import ErrorPage from './error-page';
import Posts from './Posts';
import Profile from './Profile';
import Login from './login';
import ProtectedRoute from '../protectedRoute';

const routes = [
  {
    path: '/',
    element: <ProtectedRoute element={<Root />} />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <Posts />,
      },
      {
        path: '/profile',
        element: <Profile />
      }
    ],
  },
  {
    path: '/login',
    element: <Login />,
    errorElement: <ErrorPage />,
  }
]

export default routes;