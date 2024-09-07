import { useEffect, useState } from "react";
import { Link, useFetcher } from "react-router-dom";
import UserHeader from "./userHeader";
import PostFooter from "./postFooter";
import CommentSection from "./commentSection";
import { useAuth } from "../auth/authContext";
import ImageCarousel from "./ImageCarousel";

// TODO: language localization
// TODO: aria search optimization
// TODO: show more comments should be shown only if there are more comments than shown
export default function PostListItem({ post }) {
  const auth = useAuth();
  const baseUrl = 'http://localhost:3000/uploads'
  return (
    <div className='border-2 m-2 text-text-primary-light dark:text-text-primary-dark dark:bg-background-dark bg-background-light border-gray-700 py-4 px-6 rounded-xl flex flex-col gap-2' >
      <UserHeader user={post.author} createdAt={post.createdAt} />
      <Link to={`/post/${post.id}`}>
        <li>
          <div className='flex justify-center text-lg'>
            <h4>{post.title}</h4>
          </div>

          {post.images.length > 0 && (
            <ImageCarousel images={post.images} />
          )}
          <p className="text-sm">{post.content}</p>
        </li>
      </Link>

      <PostFooter post={post}></PostFooter>
      <div className="flex flex-col gap-1">
        <CommentSection postId={post.id} isPostAuthor={post.author.id === auth.userId} short={true} />
        <Link
          to={`/post/${post.id}`}
          className="text-xs text-accent-light dark:text-accent-dark text-center"
        >
          See more comments...
        </Link>
      </div>
    </div>
  );
}