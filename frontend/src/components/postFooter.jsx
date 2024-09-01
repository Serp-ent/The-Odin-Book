import { useFetcher } from "react-router-dom";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { FaRegComment } from "react-icons/fa";

export default function PostFooter({ post }) {
  const likeFetcher = useFetcher({ key: "likePost" });
  // TODO: add props validation
  // TODO: commenting post button should move to comment section

  // TODO: there should be number of comments next to comment button

  // TODO: user should be able to remove its own comments
  // TODO: if its user post he should be able to moderate comments

  return (
    <div className="flex justify-end text-xl gap-4 border rounded p-2">
      <likeFetcher.Form
        method="post"
        action={`/post/${post.id}/like`}
      >
        <div className="flex items-center gap-4 text-xl">
          <div className="flex items-center gap-1">
            <p className="text-xs items-center">
              {post.likes}
            </p>
            <button
              className='text-xl'
              value={post.isLiked ? 'false' : 'true'}
              name="like"
              type="submit">
              {post.isLiked ? <FaHeart /> : <FaRegHeart />}
            </button>
          </div>

        </div>
      </likeFetcher.Form>
      <div className="flex flex-col items-center">
        <button
          onClick={() => console.log("add comment to", post.id)}
        >
          <FaRegComment />
        </button>
      </div>
    </div>
  );
}