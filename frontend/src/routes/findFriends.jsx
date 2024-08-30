import { useLoaderData } from "react-router-dom";

export async function loader() {
  const response = await fetch('http://localhost:3000/api/users', {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`
    }
  });
  if (!response.ok) {
    throw new Error('Cannot fetch users');
  }

  const result = await response.json();
  return result;
}

export default function FindFriends() {
  const users = useLoaderData();

  // TODO: filter users 
  // TODO: add debouncing
  return (
    <div className="flex flex-col text-white bg-gray-700 p-2 gap-2 grow">
      <input
        className="border bg-gray-800 p-1 rounded"
        name="firstName"
        placeholder="find friends"
      />

      {/* // TODO: user user header here */}
      {/* // TODO: remove password from fetched users */}
      <ul className="border rounded p-2 flex flex-col gap-2 overflow-y-auto grow">
        {users.map(user => (
          <li key={user.id} className="flex justify-between items-center border rounded p-3">
            <div className="flex gap-2 items-center">
              <img src={user.profilePic}
                className="w-8 rounded-full" />
              <h4>{user.firstName} {user.lastName}</h4>
            </div>

            <button className="block text-xs border px-1 rounded"
              onClick={() => console.log(`Follow user ${user.id}`)}>
              Follow
            </button>
          </li>
        ))}

      </ul>
    </div>
  );
}