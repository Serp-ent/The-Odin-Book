import { Link, useFetcher, useLoaderData, useLocation, useNavigate } from "react-router-dom"
import { json } from "react-router-dom";
import UserHeader from "../components/userHeader";
import { useEffect, useState } from "react";
import PostFooter from "../components/postFooter";
import CommentSection from "../components/commentSection";

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

// TODO: allow user for posting images
// TODO: create some kind of guest account
export default function Post() {
  const post = useLoaderData();
  const [postData, setPostData] = useState(post);

  const likeFetcher = useFetcher({ key: "likePost" });
  const followFetcher = useFetcher({ key: "followUser" });

  // TODO: should remove authorId field (duplicates data with author object)
  useEffect(() => {
    if (followFetcher.data) {
      setPostData(prevPost => ({
        ...prevPost,
        author: followFetcher.data
      }));
    }
  }, [followFetcher.data]);

  useEffect(() => {
    if (likeFetcher.data) {
      const { isLiked, likesCount } = likeFetcher.data;
      setPostData(prevData => ({
        ...prevData,
        isLiked,
        likes: likesCount,
      }));
    }

  }, [likeFetcher.data])

  if (navigation.state === 'loading') {
    return <div>Loading...</div>
  }

  // TODO: add comment infinite scrolling
  // TODO: add sorting comments (newest, top likes, oldest etc)

  return (
    <main
      className='p-4 container bg-gray-800 text-white over overflow-y-auto flex flex-col gap-2'>
      <UserHeader user={postData.author} />

      <div className="">
        {post.content}
      </div>

      <PostFooter post={postData} />


      <CommentSection postId={post.id} />
    </main>
  );
}