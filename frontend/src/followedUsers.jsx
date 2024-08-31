import { json, Link, NavLink, useFetcher, useLoaderData } from 'react-router-dom';
import './index.css'
import { useEffect, useState } from "react"
import UserHeader from './components/userHeader';

export const loader = async () => {
  const response = await fetch(`http://localhost:3000/api/users/followed`, {
    headers: {
      'Content-Type': "application/json",
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`
    }
  });

  if (!response.ok) {
    return json({ message: "Failed to load followed users" }, { status: response.status });
  }

  const data = await response.json();
  return json(data);
}

// TODO: add infinite scrolling
// TODO: add nice loading spinner
export default function FollowedUsers() {
  const followedUsers = useLoaderData();

  return (
    <aside
      className='bg-gray-800 shadow flex flex-col overflow-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-400 text-white container'
    >
      {/* TODO: should leave unfollowed users until refresh to allow follow on missclick */}
      {
        followedUsers.length === 0 ?
          (
            <div className='flex justify-center flex-col items-center h-full gap-2 '>
              <h2>
                You don&apos;t follow any users
              </h2>
              <Link to={`/users/`} className='border rounded py-1 px-2'>
                Find friends
              </Link>
            </div>
          )
          : (
            <>
              <p className='flex justify-center align-center pt-2 text-xl font-bold'> Followed </p>
              <ul>
                {
                  followedUsers.map((u) => {
                    return (
                      <li className='text-white border-2 rounded-lg p-4 m-2'
                        key={u.id} >
                        <UserHeader user={u} />
                      </li>
                    )
                  })
                }
              </ul>
            </>
          )
      }
    </aside >
  );
}