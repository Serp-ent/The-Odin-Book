import Root from './root';
import ErrorPage from './error-page';
import PostList, {
  loader as postListLoader,
  action as likeAction,
  createPost,
} from './PostList';
import Profile, {
  profileLoader,
  action as followProfile,
} from './Profile';
import Login from './login';
import ProtectedRoute from '../protectedRoute';
import Register from './register';
import Post, { createComment, loader as postLoader } from './Post';
import FollowedUsers from '../followedUsers';
import Users from './Users';
import ProfileSettings from './profileSettings';

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
            element: <ProtectedRoute element={<PostList />} />,
            loader: postListLoader
          },
          {
            path: '/post/:postId',
            element: <ProtectedRoute element={<Post />} />,
            loader: postLoader,
          },
          {
            path: '/post/:postId/like',
            action: likeAction,
          },
          {
            path: '/post/:postId/comment',
            action: createComment,
          },
          {
            path: '/post/',
            action: createPost,
          },
          {
            path: '/profile/:userId',
            element: <ProtectedRoute element={<Profile />} />,
            loader: profileLoader,
            action: followProfile,
          },
          {
            path: '/login',
            element: <Login />,
          },
          {
            path: '/register',
            element: <Register />,
          },
          {
            path: '/users/followed',
            element: <ProtectedRoute element={<FollowedUsers />} />
          },
          {
            path: '/users',
            element: <ProtectedRoute element={<Users />} />
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