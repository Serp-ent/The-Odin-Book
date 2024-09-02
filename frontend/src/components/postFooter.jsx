import { useFetcher } from "react-router-dom";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { FaRegComment } from "react-icons/fa";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const likePost = async (postId, isLiked) => {
  const response = await fetch(`http://localhost:3000/api/posts/${postId}/like`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
    },
    body: JSON.stringify({ like: !isLiked }),
  });

  if (!response.ok) {
    throw new Error('Failed to like/unlike the post');
  }

  return response.json();
};

export default function PostFooter({ post }) {
  // TODO: add props validation
  // TODO: commenting post button should move to comment section

  // TODO: user should be able to remove its own comments
  // TODO: if its user post he should be able to moderate comments
  const queryClient = useQueryClient();

  const { mutate: likePostMutation } = useMutation({
    mutationFn: (isLiked) => likePost(post.id, isLiked),
    onSuccess: (updatedPost) => {
      queryClient.invalidateQueries(['post', post.id])
    },
    onError: (err) => {
      console.error('Error liking the post', err);
    }
  });

  const handleLikeClick = () => {
    likePostMutation(post.isLiked);
  }

  return (
    <div className="flex justify-end text-xl gap-4 border rounded p-2">
      <div className="flex items-center gap-4 text-xl">
        <div className="flex items-center gap-1">
          <p className="text-xs items-center">
            {post.likes}
          </p>
          <button
            className='text-xl'
            onClick={handleLikeClick}
          >
            {post.isLiked ? <FaHeart /> : <FaRegHeart />}
          </button>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <p className="text-xs items-center">
          {post.commentsCount}
        </p>
        <button
          onClick={() => console.log("add comment to", post.id)}
        >
          <FaRegComment />
        </button>
      </div>
    </div>
  );
}