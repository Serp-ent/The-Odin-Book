import { Link, useFetcher } from "react-router-dom";
import { format } from 'date-fns';
import { FaRegEye } from "react-icons/fa";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export default function UserHeader({ user, createdAt }) {
  const fetcher = useFetcher({ key: "followUser" });

  const queryClient = useQueryClient();
  const followMutation = useMutation({
    mutationFn: async (follow) => {
      const response = await fetch(`http://localhost:3000/api/users/${user.id}/follow`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify(
          { follow: !user.isFollowed }),
      });

      if (!response.ok) {
        throw new Error('Failed to follow/unfollow user');
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate or refetch the posts query to ensure the data is fresh
      queryClient.invalidateQueries(['user', user.id]);
    },
  });

  const handleFollowClick = async () => {
    const newFollowStatus = !user.isFollowed;
    await followMutation.mutateAsync(newFollowStatus);
  };

  // TODO: add props validation

  const formattedDate = createdAt ? format(new Date(createdAt), 'PPpp') : null;

  return (
    <div className="flex justify-between items-center">
      <Link className="flex items-center gap-1"
        to={`/profile/${user.id}`}>
        <img src={user.profilePic} className="w-8 rounded-full" />
        <div className="flex flex-col">
          <h4 className="text-l">
            {user.firstName} {user.lastName}
          </h4>
          {formattedDate && <p className="text-xs">{formattedDate}</p>}
        </div>
      </Link>

      <button className="px-2 py-1"
        name="follow"
        value={user.isFollowed ? "false" : "true"}
        onClick={handleFollowClick}
      >
        {user.isFollowed ? <FaRegEye className="text-xl" /> : 'Follow'}
      </button>
    </div>
  );
}