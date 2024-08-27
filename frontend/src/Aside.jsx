import { NavLink } from 'react-router-dom';
import './index.css'
import { useEffect, useState } from "react"

export default function Aside() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const newUsers = [];
    for (let i = 0; i < 20; ++i) {
      const user = {
        firstName: `FirstName${i}`,
        lastName: `LastName${i}`
      };

      newUsers.push(user);
    }

    setUsers(newUsers);
  }, []);

  return (
    <aside
      className='bg-gray-800 shadow flex flex-col gap-1 overflow-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-400'
    >
      <ul>
        {
          users.map((u, i) => {
            return (
              <li key={i}
                className='text-white border-2 rounded-lg p-4 m-2 flex justify-end'
              >
                <NavLink to={`/profile/${i}`}>
                  {u.firstName} {u.lastName}
                </NavLink>
              </li>
            )
          })
        }
      </ul>
    </aside>
  );
}