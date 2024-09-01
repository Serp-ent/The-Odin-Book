import Root from './root';
import ErrorPage from './error-page';
import PostList, {
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
import FollowedUsers, { loader as loadFollowedUsers } from '../followedUsers';
import ProfileSettings from './profileSettings';
import FindFriends, { loader as loadUsers } from './findFriends';

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
            element: <ProtectedRoute element={<Login />} requireUnlogged={true} />,
          },
          {
            path: '/register',
            element: <ProtectedRoute element={<Register />} requireUnlogged={true} />,
          },
          {
            path: '/users/followed',
            element: <ProtectedRoute element={<FollowedUsers />} />,
            loader: loadFollowedUsers,
          },
          {
            path: '/users',
            element: <ProtectedRoute element={<FindFriends />} />,
            loader: loadUsers,
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