import { useEffect, useReducer, useRef, useState } from "react";
import { json, useFetcher, useLoaderData } from 'react-router-dom';

// TODO: add loading spinner
export const loader = async ({ request }) => {
  const url = new URL(request.url);
  const page = url.searchParams.get("page") || 1;
  const limit = url.searchParams.get("limit") || 10;

  const response = await fetch(`http://localhost:3000/api/posts?page=${page}&limit=${limit}`);
  if (!response.ok) {
    throw json({ message: 'Failed to load posts' }, { status: response.status });
  }

  const data = await response.json();
  return data;
}

export default function Posts() {
  const initialData = useLoaderData();
  const [posts, setPosts] = useState(initialData.posts);
  const [page, setPage] = useState(initialData.page);
  const [totalPages, setTotalPages] = useState(initialData.totalPages);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const containerRef = useRef(null);

  const loadMorePosts = async () => {
    if (loading || !hasMore) {
      return;
    }

    setLoading(true);
    const nextPage = page + 1;
    try {
      const response = await fetch(`http://localhost:3000/api/posts?page=${nextPage}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      console.log('newDAta', data);

      if (data.posts.length > 0) {
        setPosts(prevPosts => [...prevPosts, ...data.posts]);
        setPage(nextPage);
        setTotalPages(data.totalPages);
        setHasMore(nextPage < data.totalPages);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error('Error fetching more posts:', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const handleScroll = () => {
      const container = containerRef.current;
      if (container) {
        if (container.scrollTop + container.clientHeight >= container.scrollHeight - 50) {
          loadMorePosts();
        }
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

  return (
    <main
      className='bg-gray-700 overflow-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-400 flex flex-col gap-2'
      ref={containerRef}
    >
      {posts.map((post) => (
        <div
          key={post.id}
          className='border-2 m-2 border-gray-800 py-4 px-6 rounded-xl text-white'
        >
          <div className='flex justify-center text-lg'>
            <h4>{post.title}</h4>
          </div>
          <p>{post.content}</p>
        </div>
      ))}

      {loading && <div className='text-center text-white'>Loading more posts...</div>}
      {!hasMore && <div className="text-white text-center py-4">No more posts available</div>}
    </main>
  );
}