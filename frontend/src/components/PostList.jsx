import { useEffect } from "react";
import { useFetcher } from 'react-router-dom';
import PostListItem from "./PostListItem";
import { useInfiniteQuery } from '@tanstack/react-query'
import { ClipLoader } from 'react-spinners'
import { debounce } from 'loadsh';
import { useAuth } from "../auth/authContext";

export default function PostList({ scrollContainerRef, initialType = "all", initialUserId = null }) {
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