import { useRef } from "react";
import CreatePost from "../components/createPost";
import PostList from "../components/PostList";

export default function Home() {
  const scrollContainerRef = useRef(null);

  return (
    <div
      ref={scrollContainerRef}
      className="container lg:max-w-[768px] mx-auto px-4 overflow-auto scrollbar-thin scrollbar-thumb-600 scrollbar-track-gray-400"
    >
      <CreatePost />
      <PostList
        scrollContainerRef={scrollContainerRef}
        initialType="followed" />
    </div>
  );
}