import { useFetcher } from "react-router-dom";

export default function PostFooter({ post }) {
  const likeFetcher = useFetcher({ key: "likePost" });

  // TODO: add props validation

  return (
    <likeFetcher.Form
      className="flex justify-start" method="post"
      action={`/post/${post.id}/like`}
    >
      <div className="flex justify-center items-center gap-2 border rounded py-1 px-2">
        {post.likes}
        <button
          className={`border rounded px-2 ${post.isLiked && 'bg-gray-800'}`}
          value={post.isLiked ? 'false' : 'true'}
          name="like"
          type="submit">
          {post.isLiked ? "Liked" : "Like"}</button>
      </div>
    </likeFetcher.Form>
  );
}