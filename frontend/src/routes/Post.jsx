import { Link, useFetcher, useLoaderData, useLocation, useNavigate } from "react-router-dom"
import { json } from "react-router-dom";
import UserHeader from "../components/userHeader";
import { useEffect } from "react";

export const loader = async ({ params }) => {
  const postId = parseInt(params.postId);

  // Simulate a 3-second delay
  // TODO: add loading bar
  // await new Promise(resolve => setTimeout(resolve, 2000));

  const response = await fetch(`http://localhost:3000/api/posts/${postId}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("authToken")}`,
    }
  });
  if (!response.ok) {
    throw json({ message: 'Failed to load posts' }, { status: response.status });
  }

  const data = await response.json();
  return data;
}

export const createComment = async ({ request, params }) => {
  const formData = await request.formData();
  const response = await fetch(`http://localhost:3000/api/posts/${params.postId}/comments`, {
    method: "POST",
    headers: {
      'Content-Type': "application/json",
      'Authorization': `Bearer ${localStorage.getItem("authToken")}`,
    },
    body: JSON.stringify({
      content: formData.get("content"),
    })
  });

  if (!response.ok) {
    throw new Error('Could not create comment');
  }

  return null;
}

export default function Post() {
  const post = useLoaderData();
  const fetcher = useFetcher();
  const location = useLocation();

  // useEffect(() => {
  //   if (fetcher.state === 'idle' && fetcher.data) {
  //     fetcher.load(location.pathname);
  //   }
  // }, [fetcher, location])

  if (navigation.state === 'loading') {
    return <div>Loading...</div>
  }

  // TODO: add comment infinite scrolling
  // TODO: add sorting comments (newest, top likes, oldest etc)
  return (
    <main
      className='p-4 container bg-gray-800 text-white over overflow-y-auto flex flex-col gap-2'>
      <UserHeader user={post.author} />

      <div className="">
        {post.content}
      </div>

      {/* TODO: number of comments */}
      {/* TODO: icons */}
      {/* TODO: like button should be on right side for thumb */}
      <div className="rounded border p-2">
        {/* TODO: add button for liking */}
        <button className="border rounded inline-block p-1"
          onClick={() => console.log("Like post with id", post.id)}>
          Likes: {post.likes}
        </button>
      </div>

      <div className="flex flex-col gap-2 bg-gray-700 p-2 border rounded text-sm">
        <fetcher.Form className="flex gap-1" action="comment" method="POST">
          <input
            className="border bg-gray-800 p-1 rounded grow"
            name="content"
            placeholder="comment now..."></input>
          <button className="rounded border bg-gray-900 p-1">Post</button>
        </fetcher.Form>
        {
          post.comments.length > 0 ? (
            <ul >
              {post.comments.map(comment => {
                return (
                  <li key={comment.id}
                    className="border bg-gray-800 p-2 rounded ">
                    <Link to={`/profile/${comment.author.id}`}
                      className="bg-gray-900 inline-block py-1 px-2 rounded"
                    >
                      {/* TODO: add user profile pic */}
                      {comment.author.firstName} {comment.author.lastName}
                    </Link>
                    <div>
                      {comment.content}
                    </div>

                    <div className="flex justify-end text-xs gap-1">
                      <button className="border rounded px-2 py-1"
                        onClick={() => console.log("Replying to comment with id", comment.id)}
                      >
                        Reply
                      </button>
                      <button
                        className="rounded border px-2 py-1"
                        onClick={() => console.log("Liking comment with id", comment.id)}>
                        Like
                      </button>
                    </div>
                  </li>
                )
              }
              )}
            </ul>
          ) : (
            <p>
              No Comments
            </p>
          )
        }
      </div>
    </main>
  );
}