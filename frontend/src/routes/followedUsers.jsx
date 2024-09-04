import { json, Link, NavLink, useFetcher, useLoaderData } from 'react-router-dom';
import '../index.css'
import { useEffect, useState } from "react"
import UserHeader from '../components/userHeader';
import { ClipLoader } from 'react-spinners';
import { useQuery } from '@tanstack/react-query';

export const fetchFollowedUsers = async () => {
  const response = await fetch('http://localhost:3000/api/users/followed', {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`
    }
  });

  if (!response.ok) {
    throw new Error('Failed to load followed users');
  }

  return response.json();
};

export default function FollowedUsers() {
  const { data: followedUsers = [], isLoading, isError, error } = useQuery({
    queryKey: ['followedUsers'],
    queryFn: fetchFollowedUsers,
    staleTime: 60000, // Cache data for 1 minute
  });

  if (isLoading) {
    return (
      <div className='flex justify-center items-center h-full'>
        <ClipLoader color="white" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className='flex justify-center items-center h-full text-red-500'>
        <p>Error: {error.message}</p>
      </div>
    );
  }

  return (
    <aside className='bg-gray-800 shadow flex flex-col overflow-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-400 text-white container'>
      {followedUsers.length === 0 ? (
        <div className='flex justify-center flex-col items-center h-full gap-2'>
          <h2>You don&apos;t follow any users</h2>
          <Link to={`/users/`} className='border rounded py-1 px-2'>
            Find friends
          </Link>
        </div>
      ) : (
        <>
          <p className='flex justify-center align-center pt-2 text-xl font-bold'>Followed</p>
          <ul>
            {followedUsers.map((u) => (
              <li className='text-white border-2 rounded-lg p-4 m-2' key={u.id}>
                <UserHeader user={u} />
              </li>
            ))}
          </ul>
        </>
      )}
    </aside>
  );
}