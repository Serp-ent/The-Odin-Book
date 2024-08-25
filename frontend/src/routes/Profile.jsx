export default function Profile() {
  return (
    <main className="text-white p-8 bg-gray-700 flex items-center flex-col">
      <div className="w-3/4">
        <div className="flex justify-between items-center">
          <div className="bg-white h-32 w-32 rounded-full"> </div>
          <div className="text-3xl">
            Ben Thomson
          </div>
        </div>

        <div>
          <p>Hello this is profile</p>
        </div>

        <div>
          Here is list of posts
        </div>
      </div>
    </main>
  );

}