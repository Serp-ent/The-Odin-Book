import { Link, useLoaderData } from "react-router-dom";
import UserHeader from "../components/userHeader";

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
    <div className="flex flex-col text-white p-2 gap-2 grow">
      <input
        className="border bg-gray-800 p-1 rounded"
        name="firstName"
        placeholder="find friends"
      />

      {/* // TODO: user user header here */}
      {/* // TODO: remove password from fetched users */}
      <ul className="border rounded p-2 flex flex-col gap-2 overflow-y-auto grow">
        {users.map(user => (
          <li key={user.id} className="border rounded p-3">
            <UserHeader user={user} />
          </li>
        ))}

      </ul>
    </div>
  );
}