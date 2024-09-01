import { json, Link, useFetcher, useLoaderData, useParams } from "react-router-dom";
import UserHeader from "../components/userHeader";
import PostList from "../components/PostList";

export const loader = async ({ params }) => {
  const userId = parseInt(params.userId);

  // Simulate a 3-second delay
  // TODO: add loading bar
  // await new Promise(resolve => setTimeout(resolve, 2000));

  const response = await fetch(`http://localhost:3000/api/users/${userId}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('authToken')}`,
    }
  });
  if (!response.ok) {
    throw json({ message: 'Failed to load posts' }, { status: response.status });
  }

  const user = await response.json();
  return { user };
}

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

// TODO: use this with promise all
export const profileLoader = async ({ params }) => {
  const userId = parseInt(params.userId);

  // Fetch the user profile
  const userProfileResponse = await fetch(`http://localhost:3000/api/users/${userId}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('authToken')}`,
    }
  });

  if (!userProfileResponse.ok) {
    throw new Error('Failed to load user profile');
  }

  const userProfile = await userProfileResponse.json();

  // Fetch the user posts
  const userPostsResponse = await fetch(`http://localhost:3000/api/users/${userId}/posts`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('authToken')}`,
    }
  });

  if (!userPostsResponse.ok) {
    throw new Error('Failed to load user posts');
  }

  const userPosts = await userPostsResponse.json();

  // Return both the profile and posts data
  return { userProfile, userPosts };
};


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
export default function Profile() {
  // TODO: remove user posts data from loader
  const { userProfile, userPosts } = useLoaderData();
  const { userId } = useParams();
  return (
    <main
      className="p-2 flex flex-col container text-white gap-4"
    >
      <UserHeader user={userProfile} />

      {/* TODO: post should be in order newest first */}

      {/* // TODO: fetch latest user posts */}
      {/* TODO: add infinite scrolling */}
      {/* TODO: add switch button to display latest comments too */}
      <div>
        <h3 className="flex justify-center text-xl p-1 border rounded">
          Latest Posts
        </h3>
        <PostList
          initialType="user"
          initialUserId={userId} />
      </div>
    </main>
  );

}