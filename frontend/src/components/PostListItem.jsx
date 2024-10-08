import { useEffect, useState } from "react";
import { Link, useFetcher } from "react-router-dom";
import UserHeader from "./userHeader";
import PostFooter from "./postFooter";
import CommentSection from "./commentSection";
import { useAuth } from "../auth/authContext";
import ImageCarousel from "./ImageCarousel";
import { useTranslation } from "react-i18next";
import { ClipLoader } from "react-spinners";

export default function PostListItem({ post }) {
  const { t, ready } = useTranslation('post');
  const auth = useAuth();
  const baseUrl = 'http://localhost:3000/uploads'

  return (
    <div className='border m-2 sm:px-5 text-text-primary-light dark:text-text-primary-dark dark:bg-background-dark bg-background-light border-gray-700 py-4 px-2 rounded flex flex-col gap-2' >
      <UserHeader user={post.author} createdAt={post.createdAt} />

      {!ready ? (
        <div className="flex justify-center items-center flex-col">
          <ClipLoader />
          <p>Loading Translation...</p>
        </div>
      ) : (

        <Link to={`/post/${post.id}`}>
          <li>
            <div className='flex justify-center text-lg'>
              <h4>{post.title}</h4>
            </div>

            {post.images.length > 0 && (
              <ImageCarousel images={post.images} />
            )}
            <p className="text-sm px-3">{post.content}</p>
          </li>
        </Link>
      )}

      <PostFooter post={post}></PostFooter>
      <div className="flex flex-col gap-1">
        <CommentSection postId={post.id} isPostAuthor={post.author.id === auth.userId} short={true} />
        {post.commentsCount > 0 && (<Link
          to={`/post/${post.id}`}
          className="text-xs text-accent-light dark:text-accent-dark text-center"
        >
          {t('seeMoreComments')}
        </Link>)
        }
      </div>
    </div>
  );
}