import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useFetcher } from "react-router-dom";
import { createComment } from '../routes/Post'
import { ClipLoader } from 'react-spinners'
import CommentInput from "./CommentInput";
import { useCallback, useState } from "react";
import queryString from 'query-string'
import UserHeader from "./userHeader";
import { useAuth } from "../auth/authContext";
import { useTranslation } from "react-i18next";
import { FaHeart, FaRegCommentDots, FaRegHeart, FaRegTrashAlt, FaTrash } from "react-icons/fa";

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

const commentActionButtons = [
  {
    action: 'delete',
    icon: <FaRegTrashAlt />,
    label: 'Delete',
    onClick: (commentId, deleteComment) => deleteComment(commentId),
  },
  {
    action: 'reply',
    icon: <FaRegCommentDots />,
    label: 'Reply',
    onClick: (commentId) => console.log("Replying to comment with id", commentId),
  },
  {
    action: 'like',
    icon: <FaRegHeart />,
    label: 'Like',
    onClick: (commentId) => console.log("Liking comment with id", commentId),
  },
];

export default function CommentSection({ postId, isPostAuthor = false, short = false }) {
  const queryClient = useQueryClient();
  const [sortOption, setSortOption] = useState('newest');
  const auth = useAuth();
  const { t, ready } = useTranslation('post');

  const fetchCommentsFn = useCallback(({ pageParam = 1 }) => {
    return fetchComments({ postId, pageParam, short, sort: sortOption });
  }, [postId, short, sortOption]);

  const { data, error, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ['comments', postId, short, sortOption],
    queryFn: fetchCommentsFn,
    getNextPageParam: (lastPage) => {
      return lastPage.hasNextPage ? lastPage.nextPage : undefined;
    },
    onSuccess: (data) => {
      console.log('Fetch Comments Success:', data);
    }
  });

  const mutation = useMutation({
    mutationFn: createComment,
    onSuccess: () => {
      queryClient.invalidateQueries(['comments', postId, short, sortOption]);
    }
  });

  const deleteCommentMutation = useMutation({
    mutationFn: removeComment,
    onSuccess: () => {
      queryClient.invalidateQueries(['comments', postId, short, sortOption]);
    },
    onError: (error) => {
      console.error('Error deleting comment:', error);
    },
  });

  const handleSortChange = (event) => {
    const newSortOption = event.target.value;
    setSortOption(newSortOption);
    queryClient.invalidateQueries(['comments', postId, short, newSortOption]);
  };

  if (isLoading || !ready) {
    return (
      <div className="flex justify-center">
        <ClipLoader />
      </div>
    );
  }

  if (error) {
    return <div>An error occurred! {error.message}</div>;
  }

  return (
    <div className="flex flex-col gap-2 bg-gray-200 text-text-primary-light dark:text-text-primary-dark dark:bg-background-dark p-2 border rounded text-sm">
      <CommentInput onSubmit={(content) => mutation.mutate({ postId, content })} />

      {data?.pages?.length ? (
        <div>
          {data.pages.at(0).comments.length > 0 && (
            <div className="mb-1 text-xs flex justify-end items-center">
              <label htmlFor="sort" className="text-xs font-medium text-text-primary-light dark:text-text-primary-dark">
                {t('sortBy')}:
              </label>
              <select
                id="sort"
                value={sortOption}
                onChange={handleSortChange}
                className="ml-1 text-text-primary-light dark:text-text-primary-dark dark:bg-gray-800 border border-gray-500 rounded p-1"
              >
                <option value="newest">{t('newest')}</option>
                <option value="oldest">{t('oldest')}</option>
                <option value="top_likes">{t('top')}</option>
              </select>
            </div>
          )}
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
                <div className="px-3 lg:text-base">{comment.content}</div>
                <div className="flex justify-end text-xs gap-1">
                  {commentActionButtons.map(button => (
                    isPostAuthor || (auth.userId === comment.author.id) || button.action !== 'delete' ? (
                      <button
                        key={button.action}
                        onClick={() => button.onClick(comment.id, deleteCommentMutation.mutate)}
                        className='border-gray-400 rounded px-2 py-1'
                      >
                        <span className="text-sm sm:text-base">
                          {button.icon}
                        </span>
                      </button>
                    ) : null
                  ))}
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
          {t('noComments')}
        </p>
      )}
    </div>
  );
}