import { Link, useLoaderData } from "react-router-dom";
import UserHeader from "../components/userHeader";
import { useQuery } from '@tanstack/react-query';
import { useState, useMemo } from 'react';
import debounce from 'loadsh'; // For debouncing

export const fetchUsers = async () => {
  const response = await fetch('http://localhost:3000/api/users', {
    headers: {
      'Content-Type': "application/json",
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`
    }
  });

  if (!response.ok) {
    throw new Error('Cannot fetch users');
  }

  return response.json();
};

export default function FindFriends() {
  const [searchQuery, setSearchQuery] = useState('');

  const { data: users = [], isLoading, isError, error } = useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
    staleTime: 60000, // Cache data for 1 minute
  });

  // Debounced search function
  const handleSearch = () => debounce((event) => {
    setSearchQuery(event.target.value);
  }, 300);

  // Filter users based on the search query
  const filteredUsers = users.filter(user =>
    user.firstName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div className="flex flex-col text-white p-2 gap-2 grow">
      <input
        className="border bg-gray-800 p-1 rounded"
        name="firstName"
        placeholder="Find friends"
        onChange={handleSearch}
      />

      <ul className="border rounded p-2 flex flex-col gap-2 overflow-y-auto grow h-[10vh]">
        {filteredUsers.map(user => (
          <li key={user.id} className="border rounded p-3">
            <UserHeader user={user} />
          </li>
        ))}
      </ul>
    </div>
  );
}