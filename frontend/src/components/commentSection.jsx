import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useFetcher } from "react-router-dom";
import { ClipLoader } from 'react-spinners'
import CommentInput from "./CommentInput";
import { useState } from "react";
import queryString from 'query-string'
import UserHeader from "./userHeader";
import { useAuth } from "../auth/authContext";

const fetchComments = async (postId, short = false, sort = 'newest') => {
  const queryParams = queryString.stringify({
    limit: short ? 2 : undefined,
    sort: sort !== 'newest' ? sort : 'newest',
  });

  const response = await fetch(`http://localhost:3000/api/posts/${postId}/comments?${queryParams}`, {
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
  const [sortOption, setSortOption] = useState('newest');
  const auth = useAuth();

  // TODO: use useInfiniteQuery for infinite scrolling comments
  const { data, error, isLoading } = useQuery({
    queryKey: ['comments', postId, short, sortOption],
    queryFn: () => fetchComments(postId, short, sortOption),
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
      queryClient.invalidateQueries(['comments', postId, short, sortOption]);
    }
  });

  const handleSortChange = (event) => {
    setSortOption(event.target.value);
  }

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
          <div>
            <div className="mb-1 text-xs flex justify-end items-center">
              <label htmlFor="sort" className="text-sm font-medium text-white">
                Sort by:
              </label>
              <select
                id="sort"
                value={sortOption}
                onChange={handleSortChange}
                className="ml-2 bg-gray-800 text-white border border-gray-500 rounded p-1"
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="top_likes">Top Likes</option>
              </select>
            </div>
            {/* // TODO: user should be able to remove its own comments */}
            <ul className="flex flex-col gap-2" >
              {comments.map(comment => {
                return (
                  <li key={comment.id}
                    className="border bg-gray-800 p-2 rounded ">
                    <div className="mb-2">
                      <UserHeader
                        user={comment.author}
                        createdAt={comment.createdAt} />
                    </div>
                    <div>
                      {comment.content}
                    </div>

                    {/* // TODO: post footer should be created from array with loop to have style in one place */}
                    <div className="flex justify-end text-xs gap-1">
                      {
                        (auth.userId === comment.author.id) && (
                          <button
                            className="border rounded px-2 py-1"
                            onClick={() => console.log("remove comment with id", comment.id)}
                          >
                            Delete
                          </button>
                        )
                      }
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
          </div>
        ) : (
          <p className="text-sm">
            No Comments. Be first!
          </p>
        )
      }
    </div>
  );
}