import Layout from '../components/layout';
import ErrorPage from './error-page';
import PostList, {
  createPost,
} from '../components/PostList';
import Profile, {
  action as followProfile,
} from './Profile';
import Login from './login';
import ProtectedRoute from '../auth/protectedRoute';
import Register from './register';
import Post from './Post';
import FollowedUsers from './followedUsers';
import ProfileSettings from './profileSettings';
import FindFriends from './findFriends';
import Home from './home';
import EditProfile from './editProfile';

const routes = [
  {
    path: '/',
    element: <Layout />,
    errorElement: <ErrorPage />,
    children: [
      {
        errorElement: <ErrorPage />,
        children: [
          {
            index: true,
            element: <ProtectedRoute element={<Home />} />,
          },
          {
            path: '/post/:postId',
            element: <ProtectedRoute element={<Post />} />,
          },
          {
            path: '/post/:postId/like',
          },
          {
            path: '/post/:postId/comment',
          },
          {
            path: '/post/',
            action: createPost,
          },
          {
            path: '/profile/:userId',
            element: <ProtectedRoute element={<Profile />} />,
            action: followProfile,
          },
          {
            path: '/profile/edit',
            element: <ProtectedRoute element={<EditProfile />} />,
          },
          {
            path: '/login',
            element: <ProtectedRoute element={<Login />} requireUnlogged={true} />,
          },
          {
            path: '/register',
            element: <ProtectedRoute element={<Register />} requireUnlogged={true} />,
          },
          {
            path: '/users/followed',
            element: <ProtectedRoute element={<FollowedUsers />} />,
          },
          {
            path: '/users',
            element: <ProtectedRoute element={<FindFriends />} />,
          },
          {
            path: '/profile/settings',
            element: <ProtectedRoute element={<ProfileSettings />} />
          },
        ]
      },
    ],
  },
]

export default routes;