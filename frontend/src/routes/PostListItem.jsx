import { useEffect, useState } from "react";
import { Link, useFetcher } from "react-router-dom";
import UserHeader from "../components/userHeader";

export default function PostListItem({ post }) {
  const fetcher = useFetcher();

  // TODO: the post page should display post only of followed users
  // and user own posts

  // TODO: from post api remove authorId and leave only author
  // TODO: add favicon
  // TODO: maybe for post lists display only first comment?
  return (
    <div className='border-2 m-2 border-gray-800 py-4 px-6 rounded-xl text-white flex flex-col gap-1' >
      <UserHeader user={post.author} />
      <Link to={`/post/${post.id}`}>
        <li>
          <div className='flex justify-center text-lg'>
            <h4>{post.title}</h4>
          </div>
          <p>{post.content}</p>
        </li>
      </Link>

      <hr />
      {/* // TODO:  fix button style (refresh is required) */}
      <fetcher.Form className="flex justify-start" method="post" action={`/post/${post.id}/like`}>
        <div className="flex justify-center items-center gap-2 border rounded py-1 px-2">
          {post.likes}
          <button
            className={`border rounded px-2 ${post.isLiked && 'bg-gray-800'}`}
            value={post.isLiked ? 'false' : 'true'}
            name="like"
            type="submit">
            {post.isLiked ? "Liked" : "Like"}</button>
        </div>
      </fetcher.Form>
    </div>
  );
}