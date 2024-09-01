import { useEffect, useReducer, useRef, useState } from "react";
import { Form, json, Link, useFetcher, useLoaderData } from 'react-router-dom';
import PostListItem from "./PostListItem";

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
export default function PostList({ initialType = "all", initialUserId = null }) {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const containerRef = useRef(null);

  const followFetcher = useFetcher({ key: "followUser" });
  const likeFetcher = useFetcher({ key: "likePost" });

  const fetchPosts = async (type, page, userId = null) => {
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

    const endpoint = getEndPoint(type, userId, page);
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
      return data;
    } catch (error) {
      console.error('Error fetching posts:', error);
      return { posts: [], totalPages: 1 };
    }
  };

  const loadMorePosts = async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    const nextPage = page + 1;

    const data = await fetchPosts(initialType, nextPage, initialUserId);

    if (data.posts.length > 0) {
      setPosts(prevPosts => [...prevPosts, ...data.posts]);
      setPage(nextPage);
      setTotalPages(data.totalPages);
      setHasMore(nextPage < data.totalPages);
    } else {
      setHasMore(false);
    }
    setLoading(false);
  };

  useEffect(() => {
    const initializePosts = async () => {
      setLoading(true);
      const data = await fetchPosts(initialType, page, initialUserId);
      setPosts(data.posts);
      setTotalPages(data.totalPages);
      setHasMore(page < data.totalPages);
      setLoading(false);
    };

    initializePosts();
  }, [initialType, initialUserId, page]);

  useEffect(() => {
    const handleScroll = () => {
      const container = containerRef.current;
      if (container && container.scrollTop + container.clientHeight >= container.scrollHeight - 50) {
        loadMorePosts();
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
    }

    return () => {
      if (container) {
        container.removeEventListener('scroll', handleScroll);
      }
    };
  }, [loading, hasMore, page]);

  useEffect(() => {
    if (followFetcher.data) {
      const user = followFetcher.data;
      setPosts(prevPosts =>
        prevPosts.map(post => post.author.id === user.id ? { ...post, author: user } : post)
      );
    }
  }, [followFetcher.data]);

  useEffect(() => {
    if (likeFetcher.data) {
      const { id, isLiked, likesCount } = likeFetcher.data;
      setPosts(prevPosts =>
        prevPosts.map(post => post.id === id ? { ...post, isLiked, likes: likesCount } : post)
      );
    }
  }, [likeFetcher.data]);

  return (
    <main className="overflow-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-400 flex flex-col gap-2" ref={containerRef}>
      <ul>
        {posts.map(post => <PostListItem key={post.id} post={post} />)}
      </ul>

      {loading && <div className='text-center text-white'>Loading more posts...</div>}
      {!hasMore && <div className="text-white text-center py-4">No more posts available</div>}
    </main>
  );
}