import CreatePost from "../components/createPost";
import PostList from "../components/PostList";

export default function Home() {
  return (
    <div className="overflow-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-400 ">
      <CreatePost />
      <PostList />
    </div>
  );
}