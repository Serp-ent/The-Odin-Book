import { json, Link, useFetcher, useLoaderData, useParams } from "react-router-dom";
import UserHeader from "../components/userHeader";
import PostList from "../components/PostList";
import { useRef } from "react";
import { useQuery } from "@tanstack/react-query";

// TODO: generate avatar using Gravatar API
// TODO: should revalidate followed sidebar
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

// TODO: add pipeline that automatically formats 
// TODO: handle if its the user own profile
// TODO: handle follow action using useFetcher
// TODO: maybe add some kind of bio
// TODO: add fetching latest comments

// TODO: if its own profile show settings button or edit
// TODO: add light theme
// TODO: add icons
// TODO: add tailwind primary color and tailwind config 

// TODO: if its user own allow to modify it
// TODO: allow user to change profile pic

// TODO: the profile should use PostList

// TODO: maybe add some info like number of followers
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

  if (isProfileLoading || isPostsLoading) {
    return <div>Loading...</div>;
  }

  if (isProfileError || isPostsError) {
    return <div>Error loading data</div>;
  }

  return (
    <main className="p-2 flex flex-col container text-white gap-4 overflow-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-400">
      <UserHeader user={userProfile} />

      <div>
        <h3 className="flex justify-center text-xl p-1 border rounded">
          Latest Posts
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