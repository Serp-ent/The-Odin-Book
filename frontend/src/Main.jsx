import { useEffect, useState } from "react";

export default function Main() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const newPosts = [];
    for (let i = 0; i < 20; ++i) {
      const post = {
        Author: {
          firstName: `FirstName${i}`,
          lastName: `LastName${i}`
        },
        title: `This is the title for post with id ${i}`,
        content: `This is the content for post with id ${i}`,
      };

      newPosts.push(post);
    }

    setPosts(newPosts);
  }, []);

  return (
    <main
      className='bg-gray-700 overflow-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-400
      flex flex-col gap-2'
    >

      {
        posts.map((post, i) => {
          return (
            <div
              key={i}
              className='border-2 m-2 border-gray-800 py-4 px-6 rounded-xl text-white'
            >
              <div className='flex justify-center text-lg'>
                <h4>{post.title}</h4>
              </div>
              <p>{post.content}</p>
            </div>
          )
        })
      }


    </main>
  );
}