import { useEffect, useState } from "react";
import { Link, useFetcher } from "react-router-dom";
import UserHeader from "./userHeader";
import PostFooter from "./postFooter";
import CommentSection from "./commentSection";
import { useAuth } from "../auth/authContext";
import ImageCarousel from "./ImageCarousel";

// TODO: dark/white color theme
// TODO: language localization
// TODO: aria search optimization
export default function PostListItem({ post }) {
  const auth = useAuth();
  const baseUrl = 'http://localhost:3000/uploads'
  return (
    <div className='border-2 m-2 border-gray-700 py-4 px-6 rounded-xl text-white flex flex-col gap-2' >
      <UserHeader user={post.author} createdAt={post.createdAt} />
      <Link to={`/post/${post.id}`}>
        <li>
          <div className='flex justify-center text-lg'>
            <h4>{post.title}</h4>
          </div>

          {post.images.length > 0 && (
            <ImageCarousel images={post.images} />
          )}
          <p>{post.content}</p>
        </li>
      </Link>

      <PostFooter post={post}></PostFooter>
      <div className="flex flex-col gap-1">
        <CommentSection postId={post.id} isPostAuthor={post.author.id === auth.userId} short={true} />
        <Link
          to={`/post/${post.id}`}
          className="text-xs text-blue-300 text-center"
        >
          See more comments...
        </Link>
      </div>
    </div>
  );
}