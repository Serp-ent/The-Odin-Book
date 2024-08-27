import { Link, useLoaderData } from "react-router-dom"
import { json } from "react-router-dom";

export const loader = async ({ params }) => {
  const postId = parseInt(params.postId);

  // Simulate a 3-second delay
  // TODO: add loading bar
  // await new Promise(resolve => setTimeout(resolve, 2000));

  const response = await fetch(`http://localhost:3000/api/posts/${postId}`);
  if (!response.ok) {
    throw json({ message: 'Failed to load posts' }, { status: response.status });
  }

  const data = await response.json();
  return data;
}

export default function Post() {
  const post = useLoaderData();

  if (navigation.state === 'loading') {
    return <div>Loading...</div>
  }

  return (
    <main
      className='p-4 container bg-gray-800 text-white over overflow-y-auto flex flex-col gap-2'>
      <div className="">
        {post.content}
      </div>

      <div>
        {post.author.firstName} {post.author.lastName}
      </div>

      {/* // TODO: add infinite scrolling for comments */}
      <ul className="flex flex-col gap-2 bg-gray-700 p-2 border rounded">
        {post.comments.map(comment => {
          return (
            <li key={comment.id}
              className="border bg-gray-800 p-2 rounded ">
              <Link to={`/profile/${comment.author.id}`}
                className="bg-gray-900 inline-block py-1 px-2 rounded"
              >
                {/* TODO: add user profilepic */}
                {comment.author.firstName} {comment.author.lastName}
              </Link>
              <div>
                {comment.content}
              </div>
            </li>
          )
        }
        )}

      </ul>
    </main>
  );
}