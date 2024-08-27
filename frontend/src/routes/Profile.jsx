import { json, useFetcher, useLoaderData } from "react-router-dom";

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

  const data = await response.json();
  return data;
}

// TODO: should revalidate followed sidebar
export async function action({ request, params }) {
  const formData = await request.formData();
  console.log(params, 'user wants to follow?', formData.get('follow') === 'true');

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
    return null;
  }

  const result = await response.json();
  console.log('TODO: sending fetch request');

  return null;
}


// TODO: handle if its the user own profile
// TODO: handle follow action using useFetcher
// TODO: maybe add some kind of bio
// TODO: add fetching latest comments
export default function Profile() {
  const user = useLoaderData();
  const fetcher = useFetcher();

  const followed = fetcher.formData
    ? fetcher.formData.get('follow') === 'true'
    : user.isFollowed;

  return (
    <main
      className="p-4 flex flex-col container bg-gray-700 text-white gap-4"
    >
      <div className="flex items-center justify-between text-2xl font-bold">
        <div className="flex items-center gap-2">
          <img src={user.profilePic} className="w-1/4 h-auto rounded-full" />
          {user.firstName} {user.lastName}
        </div>
        <fetcher.Form method='POST' className="text-sm">
          <button className="border rounded py-1 px-2"
            name="follow"
            value={followed ? "false" : "true"}
          >{followed ? 'Unfollow' : 'Follow'}</button>
        </fetcher.Form>
      </div>

      <div>
        Latest comments
      </div>
    </main>
  );

}