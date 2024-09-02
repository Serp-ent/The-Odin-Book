import { useEffect, useLayoutEffect, useReducer, useRef, useState } from "react";
import { Form, json, Link, useFetcher, useLoaderData } from 'react-router-dom';
import PostListItem from "./PostListItem";
import { useInfiniteQuery } from '@tanstack/react-query'
import { ClipLoader } from 'react-spinners'
import { debounce } from 'loadsh';

// TODO: add loading spinner
export const action = async ({ request, params }) => {
  const formData = await request.formData();
  const like = formData.get('like') === 'true';
  const postId = parseInt(params.postId);

  try {
    const response = await fetch(`http://localhost:3000/api/posts/${postId}/like`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('authToken')}`,
      },
      body: JSON.stringify({ like }),
    });

    if (!response.ok) {
      throw new Error('Failed to update like status');
    }

    const result = await response.json();
    return {
      id: postId,
      isLiked: like,
      likesCount: result.likesCount,
    };
  } catch (error) {
    console.error('Error liking/unliking post:', error);
    return {
      error: error.message,
    };
  }
};

export const createPost = async ({ request }) => {
  const formData = await request.formData();

  const response = await fetch(`http://localhost:3000/api/posts`, {
    method: "POST",
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`
    },
    body: JSON.stringify({ content: formData.get('content') })
  });

  if (!response.ok) {
    throw new Error('Could not create post');
  }
  console.log('user wants to create post with content:', formData.get('content'));
  return null;
};

// TODO: extract create post component
export default function PostList({ scrollContainerRef, initialType = "all", initialUserId = null }) {
  const followFetcher = useFetcher({ key: "followUser" });
  const likeFetcher = useFetcher({ key: "likePost" });

  const fetchPosts = async ({ pageParam = 1 }) => {
    const getEndPoint = (type, userId, page) => {
      switch (type) {
        case "followed":
          return `http://localhost:3000/api/posts/followed?page=${page}`;
        case "user":
          if (!userId) {
            throw new Error("userId is required for fetching user posts");
          }
          return `http://localhost:3000/api/users/${userId}/posts?page=${page}`;
        default:
          return `http://localhost:3000/api/posts?page=${page}`;
      }
    }

    const endpoint = getEndPoint(initialType, initialUserId, pageParam);
    try {
      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        }
      });

      if (!response.ok) {
        throw new Error('Failed to load posts');
      }

      const data = await response.json();
      return {
        posts: data.posts,
        nextPage: data.page + 1,
        totalPages: data.totalPages,
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
      return { posts: [], totalPages: 1 };
    }
  };

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useInfiniteQuery({
    queryKey: ['posts', initialType, initialUserId],
    queryFn: fetchPosts,
    getNextPageParam: (lastPage) => {
      return lastPage.nextPage <= lastPage.totalPages ? lastPage.nextPage : undefined;
    },
  });

  useEffect(() => {
    const container = scrollContainerRef.current;

    if (container) {
      const handleScroll = debounce(() => {
        if (container.scrollTop + container.clientHeight >= container.scrollHeight - 50) {
          fetchNextPage();
        }
      }, 200);

      container.addEventListener('scroll', handleScroll);

      return () => {
        container.removeEventListener('scroll', handleScroll);
      };
    }
  }, [fetchNextPage, scrollContainerRef]);

  // useEffect(() => {
  //   if (followFetcher.data) {
  //     const user = followFetcher.data;
  //     setPosts(prevPosts =>
  //       prevPosts.map(post => post.author.id === user.id ? { ...post, author: user } : post)
  //     );
  //   }
  // }, [followFetcher.data]);

  // useEffect(() => {
  //   if (likeFetcher.data) {
  //     const { id, isLiked, likesCount } = likeFetcher.data;
  //     setPosts(prevPosts =>
  //       prevPosts.map(post => post.id === id ? { ...post, isLiked, likes: likesCount } : post)
  //     );
  //   }
  // }, [likeFetcher.data]);

  const posts = data?.pages?.flatMap(page => page.posts) || [];
  return (
    <main className="flex flex-col gap-2">
      {isLoading && <div className="flex justify-center items-center">
        <ClipLoader color="white" />
      </div>}
      {!isLoading && !isError && (
        <ul>
          {posts.map(post => <PostListItem key={post.id} post={post} />)}
        </ul>
      )}

      {isError && <div className="text-center text-red-500">Error loading posts.</div>}
      {
        isFetchingNextPage && <div className="flex justify-center m-1">
          <ClipLoader color="white" />
        </div>
      }
      {!(hasNextPage) && <div className="text-white text-center py-4">No more posts available</div>}

    </main>
  );
}