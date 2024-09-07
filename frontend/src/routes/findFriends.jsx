import { Link, useLoaderData } from "react-router-dom";
import UserHeader from "../components/userHeader";
import { useQuery } from '@tanstack/react-query';
import debounce from 'lodash/debounce';
import { useState, useMemo, useCallback, useRef, useEffect } from 'react';

export const fetchUsers = async (query) => {
  const endpoint = query
    ? `http://localhost:3000/api/users?search=${query}`
    : 'http://localhost:3000/api/users';

  const response = await fetch(endpoint, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`
    }
  });

  if (!response.ok) {
    throw new Error('Cannot fetch users');
  }

  return response.json();
};

// FindFriends Component
export default function FindFriends() {
  const [inputValue, setInputValue] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const inputRef = useRef(null);

  // Debounce function setup
  const debouncedSetSearchQuery = useCallback(
    debounce((query) => {
      setSearchQuery(query);
    }, 300),
    [] // Empty dependency array to ensure debounce is only set up once
  );

  // React Query hook
  const { data: users = [], isLoading, isError, error } = useQuery({
    queryKey: ['users', searchQuery],
    queryFn: () => fetchUsers(searchQuery),
    enabled: true, // Fetch all users when searchQuery is empty
    staleTime: 60000, // Cache data for 1 minute
  });

  // Handle input change with debounced function
  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);
    debouncedSetSearchQuery(value);
  };

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [inputRef, isLoading, isError]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div className="flex flex-col text-text-primary-light dark:text-text-primary-dark p-2 gap-2 grow">
      <input
        className="border bg-gray-300 dark:bg-gray-800 p-1 rounded"
        name="firstName"
        placeholder="Find friends"
        value={inputValue} // Controlled input value
        onChange={handleInputChange}
        ref={inputRef}
      />

      {
        users.length > 0 ?
          (
            <ul className="border rounded p-2 flex flex-col gap-2 overflow-y-auto grow h-[10vh]">
              {users.map(user => (
                <li key={user.id} className="border rounded p-3">
                  <UserHeader user={user} />
                </li>
              ))}
            </ul>
          )
          : (
            <div className="h-full flex flex-col justify-center items-center">
              {
                searchQuery.length > 0 ? (
                  <>
                    <h3>
                      No user found that matches
                    </h3>
                    <p>{searchQuery}</p>
                  </>
                ) : (
                  <p>No users found</p>
                )
              }
            </div>
          )
      }
    </div>
  );
}