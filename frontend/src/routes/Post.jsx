import { Link, useFetcher, useLoaderData, useLocation, useNavigate, useParams } from "react-router-dom"
import { json } from "react-router-dom";
import UserHeader from "../components/userHeader";
import { useEffect, useState } from "react";
import PostFooter from "../components/postFooter";
import CommentSection from "../components/commentSection";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import ImageCarousel from "../components/ImageCarousel";
import { ClipLoader } from "react-spinners";

const fetchPost = async (postId) => {
  const response = await fetch(`http://localhost:3000/api/posts/${postId}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("authToken")}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to load post');
  }

  return response.json();
};

export const createComment = async ({ postId, content }) => {
  const response = await fetch(`http://localhost:3000/api/posts/${postId}/comments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem("authToken")}`,
    },
    body: JSON.stringify({ content }),
  });

  if (!response.ok) {
    throw new Error('Could not create comment');
  }

  return response.json();
};

export default function Post() {
  const { postId } = useParams();
  const queryClient = useQueryClient();

  const { data: postData, error, isLoading } = useQuery({
    queryKey: ['post', postId],
    queryFn: () => fetchPost(postId),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const commentMutation = useMutation({
    mutationFn: createComment,
    onSuccess: () => {
      queryClient.invalidateQueries(['post', postId]);
    },
  });

  const followMutation = useMutation({
    mutationFn: (updatedAuthor) => {/* Add your follow/unfollow logic here */ },
    onSuccess: (updatedAuthor) => {
      queryClient.setQueryData(['post', postId], (oldData) => ({
        ...oldData,
        author: updatedAuthor,
      }));
    },
  });

  // TODO: better errors
  if (isLoading) return (
    <div className="flex justify-center items-center h-full"><ClipLoader /></div>
  );
  if (error) return <div>Error loading post</div>;

  return (
    <main className="p-4 container bg-background-light dark:bg-background-dark text-text-primary-light dark:text-text-primary-dark overflow-y-auto flex flex-col gap-2">
      <UserHeader user={postData.author} createdAt={postData.createdAt} />

      {postData.images.length > 0 && (
        <div className="px-3">
          <ImageCarousel images={postData.images} />
        </div>
      )}

      <p>
        {postData.content}
      </p>

      <PostFooter post={postData} />

      <CommentSection
        postId={postData.id}
        onCommentSubmit={(content) => commentMutation.mutate({ postId: postData.id, content })}
      />
    </main>
  );
}