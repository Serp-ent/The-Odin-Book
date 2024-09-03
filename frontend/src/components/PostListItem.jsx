import { useEffect, useState } from "react";
import { Link, useFetcher } from "react-router-dom";
import UserHeader from "./userHeader";
import PostFooter from "./postFooter";

// TODO: dark/white color theme
// language localization
export default function PostListItem({ post }) {
  // TODO: maybe for post lists display only first comment?
  return (
    <div className='border-2 m-2 border-gray-700 py-4 px-6 rounded-xl text-white flex flex-col gap-2' >
      <UserHeader user={post.author} createdAt={post.createdAt} />
      <Link to={`/post/${post.id}`}>
        <li>
          <div className='flex justify-center text-lg'>
            <h4>{post.title}</h4>
          </div>
          <p>{post.content}</p>
        </li>
      </Link>

      <PostFooter post={post}></PostFooter>
    </div>
  );
}