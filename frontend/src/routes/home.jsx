import { useRef } from "react";
import CreatePost from "../components/createPost";
import PostList from "../components/PostList";

export default function Home() {
  const scrollContainerRef = useRef(null);

  return (
    <div
      ref={scrollContainerRef}
      className="overflow-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-400 h-screen"
    >
      <CreatePost />
      <PostList
        scrollContainerRef={scrollContainerRef}
        initialType="followed" />
    </div>
  );
}