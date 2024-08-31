import { useEffect, useState } from "react";
import { Link, useFetcher } from "react-router-dom";
import UserHeader from "../components/userHeader";
import PostFooter from "../components/postFooter";

export default function PostListItem({ post }) {
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
      <PostFooter post={post}></PostFooter>
    </div>
  );
}