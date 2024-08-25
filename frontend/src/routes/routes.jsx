import Root from './root';
import ErrorPage from './error-page';
import Posts from './Posts';
import Profile from './Profile';

const routes = [
  {
    path: '/',
    element: <Root />,
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
]

export default routes;