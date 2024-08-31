import { useEffect, useReducer, useRef, useState } from "react";
import { Form, json, Link, useFetcher, useLoaderData } from 'react-router-dom';
import PostListItem from "./PostListItem";

// TODO: add loading spinner
export const loader = async ({ request }) => {
  const url = new URL(request.url);
  const page = url.searchParams.get("page") || 1;
  const limit = url.searchParams.get("limit") || 10;

  // TDOO: triger refetch using useLocation on like
  const response = await fetch(`http://localhost:3000/api/posts?page=${page}&limit=${limit}`, {
    method: "GET",
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
    }
  });
  if (!response.ok) {
    throw json({ message: 'Failed to load posts' }, { status: response.status });
  }

  const data = await response.json();
  return data;
}

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
    // Return the updated post data, including isLiked and like count
    return {
      id: postId,
      isLiked: like, // assuming you want to reflect the like state from the client-side action
      likesCount: result.likesCount, // include the updated like count if needed
    };
  } catch (error) {
    console.error('Error liking/unliking post:', error);
    return {
      error: error.message,
    };
  }
}

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
}

export default function PostList() {
  const initialData = useLoaderData();
  const [posts, setPosts] = useState(initialData.posts);
  const [page, setPage] = useState(initialData.page);
  const [totalPages, setTotalPages] = useState(initialData.totalPages);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const containerRef = useRef(null);
  const fetcher = useFetcher({ key: "followUser" });

  const loadMorePosts = async () => {
    if (loading || !hasMore) {
      return;
    }

    setLoading(true);
    const nextPage = page + 1;
    try {
      const response = await fetch(`http://localhost:3000/api/posts?page=${nextPage}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();

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

  useEffect(() => {
    if (fetcher.data) {
      const user = fetcher.data;
      // Update the posts with the new user data
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.author.id === user.id
            ? { ...post, author: user }
            : post
        )
      );
    }
  }, [fetcher.data]);


  return (
    <main
      className='bg-gray-700 overflow-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-400 flex flex-col gap-2'
      ref={containerRef}
    >
      <fetcher.Form className="bg-gray-800 text-white border-2 rounded m-2 p-2 border-gray-500 flex flex-col gap-1"
        action="/post" method="POST">
        <input className="border bg-gray-800 p-1 rounded"
          placeholder="How do you feel?"
          name="content"
        ></input>
        <div className="flex justify-end">
          <button className="border-2 border-gray-500 rounded py-1 text-sm px-2"
            type="submit">
            Publish</button>
        </div>
      </fetcher.Form>
      <ul>
        {posts.map((post) => <PostListItem key={post.id} post={post} />)}
      </ul>

      {loading && <div className='text-center text-white'>Loading more posts...</div>}
      {!hasMore && <div className="text-white text-center py-4">No more posts available</div>}
    </main>
  );
}