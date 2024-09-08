import { json, Link, useFetcher, useLoaderData, useParams } from "react-router-dom";
import UserHeader from "../components/userHeader";
import PostList from "../components/PostList";
import { format } from 'date-fns'
import { useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../auth/authContext";
import { useTranslation } from "react-i18next";

export async function action({ request, params }) {
  const formData = await request.formData();
  if (!['true', 'false'].includes(formData.get('follow'))) {
    throw new Error('form should contain follow with value true or false received:',
      formData.get('follow'));
  }

  const response = await fetch(`http://localhost:3000/api/users/${parseInt(params.userId)}/follow`, {
    method: "POST",
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('authToken')}`,
    },
    body: JSON.stringify(
      { follow: formData.get('follow') === 'true' }),
  });

  if (!response.ok) {
    throw new Error(`Failed to perform ${formData.get('follow') === 'true' ? 'follow' : 'unfollow'} action`);
  }

  const result = await response.json();
  return json(result, { status: 200 });
}

const fetchUserProfile = async (userId) => {
  const response = await fetch(`http://localhost:3000/api/users/${userId}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('authToken')}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to load user profile');
  }

  return response.json();
};

const fetchUserPosts = async (userId) => {
  const response = await fetch(`http://localhost:3000/api/users/${userId}/posts`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('authToken')}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to load user posts');
  }

  return response.json();
};

export default function Profile() {
  const { userId } = useParams();
  const container = useRef(null);
  const auth = useAuth();
  const { t, ready } = useTranslation('profile');

  // Fetch user profile
  const { data: userProfile, isLoading: isProfileLoading, isError: isProfileError } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => fetchUserProfile(userId),
  });

  // Fetch user posts
  const { data: userPosts, isLoading: isPostsLoading, isError: isPostsError } = useQuery({
    queryKey: ['userPosts', userId],
    queryFn: () => fetchUserPosts(userId),
  });

  if (isProfileLoading || isPostsLoading || !ready) {
    return <div>Loading...</div>;
  }

  if (isProfileError || isPostsError) {
    return <div>Error loading data</div>;
  }

  const isOwnProfile = auth.userId === parseInt(userId, 10);
  const formattedDate = format(new Date(userProfile.registeredAt), 'PPpp');
  return (
    <main className="flex flex-col container px-4 mx-auto lg:w-[768px] text-text-primary-light dark:text-text-primary-dark  gap-4 overflow-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-400">
      <div className="p-3 flex flex-col gap-4">
        {isOwnProfile ? (
          <div className="flex justify-between ">
            <UserHeader user={userProfile} />
            <div className="flex justify-end text-sm">
              <Link to={`/profile/edit`}>
                <button className="bg-blue-500 text-white px-2 py-1 rounded">{t('editProfile')}</button>
              </Link>
            </div>
          </div>
        ) : (
          <UserHeader user={userProfile} />
        )}

        <div className="text-sm">
          <p>{t('email')}: {userProfile.email}</p>
          <p>{t('registeredAt')}: {formattedDate}</p>
          {
            userProfile.bio && (
              <div className="flex flex-col justify-center items-center mt-2">
                <p>{userProfile.bio}</p>
              </div>
            )
          }
        </div>

        <div className="flex justify-around gap-5 text-sm">
          <div className="rounded border py-1 px-2">
            <h4>{t('followers')}</h4>
            <p className="text-center text-xl">{userProfile.followerCount}</p>
          </div>
          <div className="rounded border py-1 px-2">
            <h4>{t('followed')}</h4>
            <p className="text-center text-xl">{userProfile.followedCount}</p>
          </div>
        </div>
      </div>

      <div>
        <h3 className="flex justify-center text-xl p-1 border rounded">
          {t('latestPosts')}
        </h3>
        <PostList
          scrollContainerRef={container}
          initialType="user"
          initialUserId={userId}
        />
      </div>
    </main>
  );
}