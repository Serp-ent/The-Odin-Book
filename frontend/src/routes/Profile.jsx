import { json, Link, useFetcher, useLoaderData } from "react-router-dom";

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
    throw new Error('Failed to perform follow/unfollow action');
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
export default function Profile() {
  const { userProfile, userPosts } = useLoaderData();
  const fetcher = useFetcher();

  const followed = fetcher.formData
    ? fetcher.formData.get('follow') === 'true'
    : userProfile.isFollowed;

  return (
    <main
      className="p-4 flex flex-col container bg-gray-700 text-white gap-4"
    >
      <div className="flex items-center justify-between text-2xl font-bold">
        <div className="flex items-center gap-2">
          <img src={userProfile.profilePic} className="w-1/4 h-auto rounded-full" />
          {userProfile.firstName} {userProfile.lastName}
        </div>
        <fetcher.Form method='POST' className="text-sm">
          <button className="border rounded py-1 px-2"
            name="follow"
            value={followed ? "false" : "true"}
          >{followed ? 'Unfollow' : 'Follow'}</button>
        </fetcher.Form>
      </div>

      {/* // TODO: fetch latest user posts */}
      {/* TODO: add infinite scrolling */}
      {/* TODO: add switch button to display latest comments too */}
      <div className="container border rounded p-2 flex flex-col gap-3">
        <h3 className="flex justify-center text-xl p-1 border rounded">
          Latest Posts
        </h3>
        <ul className="flex flex-col gap-2">
          {console.log(userPosts)}
          {userPosts.map(post => (
            <li key={post.id}
              className="border rounded flex justify-center p-2">
              <Link to={`/post/${post.id}`} className="grow">
                {post.content}
              </Link>
            </li>
          )
          )}
        </ul>
      </div>
    </main>
  );

}