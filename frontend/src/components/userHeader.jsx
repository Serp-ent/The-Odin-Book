import { Link, useFetcher } from "react-router-dom";

import { FaRegEye } from "react-icons/fa";

export default function UserHeader({ user }) {
  const fetcher = useFetcher({ key: "followUser" });

  // TODO: implement optimistic ui
  // const followed = fetcher.formData
  //   ? fetcher.formData.get('follow') === 'true'
  //   : user.isFollowed;

  // TODO: add props validation

  return (
    <div className="flex justify-between items-center">
      <Link className="flex items-center gap-1"
        to={`/profile/${user.id}`}>
        <img src={user.profilePic} className="w-8 rounded-full" />
        <h4 className="text-l">
          {user.firstName} {user.lastName}
        </h4>
      </Link>

      {/* TODO: there is need to refresh page to see the result */}
      <fetcher.Form method='POST' action={`/profile/${user.id}`}
        className="border rounded text-sm">
        <button className="px-2 py-1"
          name="follow"
          value={user.isFollowed ? "false" : "true"}
        >{user.isFollowed ? <FaRegEye className="text-xl" /> : 'Follow'}</button>
      </fetcher.Form>
    </div>
  );
}