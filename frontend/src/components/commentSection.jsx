import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useFetcher } from "react-router-dom";
import { createComment } from '../routes/Post'
import { ClipLoader } from 'react-spinners'
import CommentInput from "./CommentInput";
import { useCallback, useState } from "react";
import queryString from 'query-string'
import UserHeader from "./userHeader";
import { useAuth } from "../auth/authContext";

const fetchComments = async ({ postId, pageParam = 1, short = false, sort = 'newest' }) => {
  const queryParams = queryString.stringify({
    limit: short ? 2 : 10,
    sort: sort !== 'newest' ? sort : 'newest',
    page: pageParam,
  });

  const response = await fetch(`http://localhost:3000/api/posts/${postId}/comments?${queryParams}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('authToken')}`,
    }
  });
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }

  const data = await response.json();

  return {
    comments: data.comments,
    nextPage: data.nextPage, // Assuming API sends nextPage info
    hasNextPage: data.hasNextPage, // Assuming API sends hasNextPage info
  }
}

const removeComment = async (commentId) => {
  const response = await fetch(`http://localhost:3000/api/comments/${commentId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${localStorage.getItem('authToken')}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to delete comment');
  }

  return response.json();
};

export default function CommentSection({ postId, isPostAuthor = false, short = false }) {
  const queryClient = useQueryClient();
  const [sortOption, setSortOption] = useState('newest');
  const auth = useAuth();

  const fetchCommentsFn = useCallback(({ pageParam = 1 }) => {
    return fetchComments({ postId, pageParam, short, sort: sortOption });
  }, [postId, short, sortOption]);

  const {
    data,
    error,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['comments', postId, short, sortOption],
    queryFn: fetchCommentsFn,
    getNextPageParam: (lastPage) => {
      return lastPage.hasNextPage ? lastPage.nextPage : undefined;
    },
    onSuccess: (data) => {
      // Optional: perform actions when the query is successful
      console.log('Fetch Comments Success:', data);
    }
  });

  const mutation = useMutation({
    mutationFn: createComment,
    onSuccess: (newComment) => {
      // Invalidate query to refetch comments with new comment
      queryClient.invalidateQueries(['comments', postId, short, sortOption]);
    }
  });

  const deleteCommentMutation = useMutation({
    mutationFn: removeComment,
    onSuccess: () => {
      // Invalidate queries to refetch comments after a successful deletion
      queryClient.invalidateQueries(['comments', postId, short, sortOption]);
    },
    onError: (error) => {
      // Handle error if needed
      console.error('Error deleting comment:', error);
    },
  });

  const handleSortChange = (event) => {
    const newSortOption = event.target.value;
    setSortOption(newSortOption);
    queryClient.invalidateQueries(['comments', postId, short, newSortOption]); // Invalidate query with new sort option
  };

  if (isLoading) {
    return (
      <div className="flex justify-center">
        <ClipLoader color="white" />
      </div>
    );
  }

  if (error) {
    return <div>An error occurred! {error.message}</div>;
  }

  return (
    <div className="flex flex-col gap-2 bg-gray-200 text-text-primary-light dark:text-text-primary-dark dark:bg-background-dark p-2 border rounded text-sm">
      <CommentInput onSubmit={(content) => mutation.mutate({ postId, content })} />

      {
        data?.pages?.length ? (
          <div>
            <div className="mb-1 text-xs flex justify-end items-center">
              <label htmlFor="sort" className="text-xs font-medium text-text-primary-light dark:text-text-primary-dark">
                Sort by:
              </label>
              <select
                id="sort"
                value={sortOption}
                onChange={handleSortChange}
                className="ml-1 text-text-primary-light dark:text-text-primary-dark dark:bg-gray-800 border border-gray-500 rounded p-1"
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="top_likes">Top Likes</option>
              </select>
            </div>
            <ul className="flex flex-col gap-2">
              {data.pages.flatMap(page => page.comments).map(comment => (
                <li key={comment.id} className="border border-gray-300 dark:bg-gray-800 p-2 rounded">
                  <div className="mb-2">
                    <UserHeader
                      user={comment.author}
                      createdAt={comment.createdAt}
                      size="small"
                    />
                  </div>
                  <div>{comment.content}</div>
                  <div className="flex justify-end text-xs gap-1">
                    {(isPostAuthor || (auth.userId === comment.author.id)) && (
                      <button
                        className="border border-gray-400 rounded px-2 py-1"
                        onClick={() => deleteCommentMutation.mutate(comment.id)}
                      >
                        Delete
                      </button>
                    )}
                    <button
                      className="border border-gray-400 rounded px-2 py-1"
                      onClick={() => console.log("Replying to comment with id", comment.id)}
                    >
                      Reply
                    </button>
                    <button
                      className="border border-gray-400 rounded px-2 py-1"
                      onClick={() => console.log("Liking comment with id", comment.id)}
                    >
                      Like
                    </button>
                  </div>
                </li>
              ))}
            </ul>
            {(!short && hasNextPage) && (
              <div className="flex justify-center">
                <button
                  className="mt-2 bg-blue-500 text-white px-2 py-1 text-xs rounded"
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                >
                  {isFetchingNextPage ? 'Loading...' : 'Load More'}
                </button>
              </div>
            )}
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