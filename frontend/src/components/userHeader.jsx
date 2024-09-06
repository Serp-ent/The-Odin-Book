import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { FaRegEye } from 'react-icons/fa';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../auth/authContext';

// URL for the fallback avatar
const fallbackAvatarUrl = 'https://www.gravatar.com/avatar/?d=mp';

export default function UserHeader({ user, createdAt, size = 'medium' }) {
  const auth = useAuth();
  const queryClient = useQueryClient();
  const [imgSrc, setImgSrc] = useState(`http://localhost:3000/uploads/${user.profilePic}`);

  const followMutation = useMutation({
    mutationFn: async (follow) => {
      const response = await fetch(`http://localhost:3000/api/users/${user.id}/follow`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify({ follow }),
      });

      if (!response.ok) {
        throw new Error('Failed to follow/unfollow user');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['user', user.id]);
    },
  });

  const handleFollowClick = async () => {
    const newFollowStatus = !user.isFollowed;
    await followMutation.mutateAsync(newFollowStatus);
  };

  const formattedDate = createdAt ? format(new Date(createdAt), 'PPpp') : null;

  const sizes = {
    small: {
      profilePicSize: 'w-6',
      textSize: 'text-xs',
      buttonSize: 'px-1 py-0.5',
      iconSize: 'text-sm',
    },
    medium: {
      profilePicSize: 'w-8',
      textSize: 'text-sm',
      buttonSize: 'px-2 py-1',
      iconSize: 'text-lg',
    },
    large: {
      profilePicSize: 'w-10',
      textSize: 'text-lg',
      buttonSize: 'px-3 py-2',
      iconSize: 'text-xl',
    },
  };

  const selectedSize = sizes[size] || sizes.medium;

  const handleError = () => {
    setImgSrc(fallbackAvatarUrl);
  };

  return (
    <div className="flex justify-between items-center">
      <Link className="flex items-center gap-2" to={`/profile/${user.id}`}>
        <img
          src={imgSrc}
          onError={handleError}
          className={`${selectedSize.profilePicSize} rounded-full`}
          alt={`${user.firstName} ${user.lastName}`}
        />
        <div className="flex flex-col">
          <h4 className={selectedSize.textSize}>
            {user.firstName} {user.lastName}
          </h4>
          {formattedDate && <p className={`text-xs ${selectedSize.textSize}`}>{formattedDate}</p>}
        </div>
      </Link>

      {auth.userId !== user.id && (
        <button
          className={selectedSize.buttonSize}
          name="follow"
          value={user.isFollowed ? "false" : "true"}
          onClick={handleFollowClick}
        >
          {user.isFollowed ? <FaRegEye className={selectedSize.iconSize} /> : 'Follow'}
        </button>
      )}
    </div>
  );
}

UserHeader.propTypes = {
  user: PropTypes.shape({
    id: PropTypes.number.isRequired,
    profilePic: PropTypes.string,
    firstName: PropTypes.string.isRequired,
    lastName: PropTypes.string.isRequired,
    isFollowed: PropTypes.bool.isRequired,
  }).isRequired,
  createdAt: PropTypes.string,
  size: PropTypes.oneOf(['small', 'medium', 'large']),
};