import { Link, NavLink, useFetcher } from 'react-router-dom';
import './index.css'
import { useEffect, useState } from "react"

// TODO: add infinite scrolling
// TODO: add nice loading spinner
export default function FollowedUsers() {
  const [followedUsers, setFollowed] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const fetcher = useFetcher();

  useEffect(() => {
    const fetchFollowedUsers = async () => {
      try {
        const response = await fetch(`http://localhost:3000/api/users/followed`, {
          headers: {
            'Content-Type': "application/json",
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          }
        });
        if (!response.ok) {
          throw new Error('Failed to fetch followed users');
        }

        const data = await response.json();
        setFollowed(data);
      } catch (error) {
        console.error('Error fetching followed users:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }

    fetchFollowedUsers();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;


  console.log(followedUsers);
  const followed = true;
  // const followed = fetcher.formData
  //   ? fetcher.formData.get('follow') === 'true'
  //   : userProfile.isFollowed;

  // TODO: fix that component
  // TODO: create user brief info component
  return (
    <aside
      className='bg-gray-800 shadow flex flex-col overflow-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-400'
    >
      <p className='text-white flex justify-center align-center pt-2 text-xl font-bold'> Followed </p>
      <ul>
        {
          followedUsers.map((u) => {
            return (
              <li className='text-white border-2 rounded-lg p-4 m-2 flex justify-between items-center'
                key={u.id} >
                <Link to={`/profile/${u.id}`}>
                  <div className='flex items-center gap-1'>
                    <img
                      className='w-10 rounded-full'
                      src={u.profilePic} />
                    <h5>
                      {u.firstName} {u.lastName}
                    </h5>
                  </div>
                </Link>

                {/* TODO: add icons using react icons */}
                <fetcher.Form method='POST' action={`/profile/${u.id}`}
                  className="text-sm">
                  <button className="border rounded py-1 px-2"
                    name="follow"
                    value={followed ? "false" : "true"}
                  >{followed ? 'Unfollow' : 'Follow'}</button>
                </fetcher.Form>
              </li>
            )
          })
        }
      </ul>
    </aside >
  );
}