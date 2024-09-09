import { useFetcher } from "react-router-dom";
import { useSpring, animated } from '@react-spring/web';
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { FaRegComment } from "react-icons/fa";
import PropTypes from 'prop-types'
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

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
  const queryClient = useQueryClient();

  const [props, api] = useSpring(() => ({
    transform: 'scale(1)',
    config: { tension: 300, friction: 10 },
  }));


  const { mutate: likePostMutation } = useMutation({
    mutationFn: () => likePost(post.id, post.isLiked),
    onMutate: () => {
      queryClient.setQueryData(['post', post.id], (oldData) => ({
        ...oldData,
        isLiked: !post.isLiked,
        likes: post.isLiked ? post.likes - 1 : post.likes + 1,
      }));

      api.start({ transform: 'scale(1.2)' });
      setTimeout(() => api.start({ transform: 'scale(1)' }), 150);
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
    <div className="flex justify-end gap-4 border rounded p-2 border-text-secondary-light bg:border-text-secondary-dark">
      <div className="flex items-center gap-4 text-xl">
        <div className="flex items-center gap-1">
          <p className="text-xs items-center">
            {post.likes}
          </p>
          <button
            onClick={handleLikeClick}
            className="text-xl sm:text-2xl"
          >
            <animated.div style={props}>
              {post.isLiked ? <FaHeart className="text-red-500" /> : <FaRegHeart />}
            </animated.div>
          </button>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <p className="text-xs items-center">
          {post.commentsCount}
        </p>
        <button
          onClick={() => console.log("add comment to", post.id)}
          className="text-xl sm:text-2xl"
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