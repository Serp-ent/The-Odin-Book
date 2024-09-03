import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useFetcher } from "react-router-dom";
import { ClipLoader } from 'react-spinners'
import CommentInput from "./CommentInput";

const fetchComments = async (postId, short = false) => {
  // Determine the endpoint based on whether we want short comments or all comments
  const limitParam = short ? '?limit=2' : '';
  const response = await fetch(`http://localhost:3000/api/posts/${postId}/comments${limitParam}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('authToken')}`,
    }
  });

  if (!response.ok) {
    throw new Error('Network response was not ok');
  }

  return response.json();
}
export default function CommentSection({ postId, short = false }) {
  const queryClient = useQueryClient();

  // TODO: use useInfiniteQuery for infinite scrolling comments
  const { data, error, isLoading } = useQuery({
    queryKey: ['comments', postId],
    queryFn: () => fetchComments(postId, short),
  });

  const mutation = useMutation({
    mutationFn: (newComment) => {
      return fetch(`http://localhost:3000/api/posts/${postId}/comments`, {
        method: "POST",
        headers: {
          'Content-Type': "application/json",
          'Authorization': `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify({ content: newComment.content }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['comments', postId]);
    }
  });

  if (isLoading) {
    return (
      <div className="flex justify-center">
        <ClipLoader color="white" />
      </div>
    )
  }

  if (error) {
    return <div>An error occurred! {error.message}</div>
  }

  const comments = data.comments;

  return (
    <div className="flex flex-col gap-2 bg-gray-700 p-2 border rounded text-sm">
      <CommentInput onSubmit={content => mutation.mutate({ postId, content })} />

      {
        comments.length > 0 ? (
          <ul className="" >
            {comments.map(comment => {
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
          <p className="text-sm">
            No Comments. Be first!
          </p>
        )
      }
    </div>
  );
}