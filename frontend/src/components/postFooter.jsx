import { useFetcher } from "react-router-dom";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { FaRegComment } from "react-icons/fa";
import PropTypes from 'prop-types'
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
  // TODO: the heart should be red
  // TDOO: add animation when post is hearted
  const queryClient = useQueryClient();

  const { mutate: likePostMutation } = useMutation({
    mutationFn: () => likePost(post.id, post.isLiked),
    onMutate: () => {
      // Optimistic update
      queryClient.setQueryData(['post', post.id], (oldData) => ({
        ...oldData,
        isLiked: !post.isLiked,
        likes: post.isLiked ? post.likes - 1 : post.likes + 1,
      }));
    },
    onError: (err, variables, context) => {
      console.error('Error liking the post', err);
      queryClient.setQueryData(['post', post.id], context.previousData);
    },
    onSettled: () => {
      queryClient.invalidateQueries(['post', post.id]);
    },
  });

  const handleLikeClick = () => {
    likePostMutation();
  };

  return (
    <div className="flex justify-end text-xl gap-4 border rounded p-2 border-text-secondary-light bg:border-text-secondary-dark">
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

PostFooter.propTypes = {
  post: PropTypes.shape({
    id: PropTypes.number.isRequired,
    likes: PropTypes.number.isRequired,
    isLiked: PropTypes.bool.isRequired,
    commentsCount: PropTypes.number.isRequired,
  }).isRequired,
};