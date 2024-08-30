import { useEffect, useState } from "react";
import { Link, useFetcher } from "react-router-dom";

export default function PostListItem({ post }) {
  const fetcher = useFetcher();
  const [liked, setLiked] = useState(post.isLiked);
  const [likesCount, setLikesCount] = useState(post.likes);

  // TODO: the post page should display post only of followed users
  // and user own posts
  useEffect(() => {
    if (fetcher.data) {
      setLiked(fetcher.data.isLiked);
      setLikesCount(fetcher.data.likesCount);
    }
  }, [fetcher.data]);


  // TODO: from post api remove authorId and leave only author
  // TODO: add favicon
  // TODO: maybe for post lists display only first comment?

  const followed = fetcher.formData
    ? fetcher.formData.get('follow') === 'true'
    : post.author.isFollowed;

  console.log(post.author)
  return (
    <div className='border-2 m-2 border-gray-800 py-4 px-6 rounded-xl text-white flex flex-col gap-1' >
      <div className="flex justify-between items-center">
        <Link className="flex items-center gap-1"
          to={`/profile/${post.author.id}`}>
          <img src={post.author.profilePic} className="w-8 rounded-full" />
          <h4 className="text-l">
            {post.author.firstName} {post.author.lastName}
          </h4>
        </Link>

        {/* TODO: there is need to refresh page to see the result */}
        <fetcher.Form method='POST' action={`/profile/${post.author.id}`}
          className="text-sm">
          <button className="border rounded py-1 px-2"
            name="follow"
            value={followed ? "false" : "true"}
          >{followed ? 'Unfollow' : 'Follow'}</button>
        </fetcher.Form>
      </div>
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
          {likesCount}
          <button
            className={`border rounded px-2 ${post.isLiked && 'bg-gray-800'}`}
            value={liked ? 'false' : 'true'}
            name="like"
            type="submit">
            {liked ? "Liked" : "Like"}</button>
        </div>
      </fetcher.Form>
    </div>
  );
}