import { Link, useFetcher, useLoaderData } from "react-router-dom"
import { json } from "react-router-dom";

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

  if (navigation.state === 'loading') {
    return <div>Loading...</div>
  }

  // TODO: add comment infinite scrolling
  // TODO: add sorting comments (newest, top likes, oldest etc)
  return (
    <main
      className='p-4 container bg-gray-800 text-white over overflow-y-auto flex flex-col gap-2'>
      <div className="flex justify-between items-center gap-2 px-1">
        <Link className="flex justify-start items-center gap-2"
          to={`/profile/${post.author.id}`}>
          <img
            className="w-9 h-auto rounded-full"
            src={post.author.profilePic} />
          <p className="font-bold">
            {post.author.firstName} {post.author.lastName}
          </p>
        </Link>

        {/* TODO: button following functionality
        TODO: don't show when user own user post */}
        <button className="text-sm border rounded py-1 px-2">Follow</button>
      </div>

      <div className="">
        {post.content}
      </div>

      {/* TODO: number of comments */}
      {/* TODO: icons */}
      {/* TODO: like button should be on right side for thumb */}
      <div className="rounded border p-2">
        {/* TODO: add button for liking */}
        <p className="border rounded inline-block p-1">
          Likes: {post.likes}
        </p>
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