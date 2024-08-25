import { Link, useRouteError } from "react-router-dom";

export default function ErrorPage() {
  const error = useRouteError();
  console.log(error);

  return (
    <div
      className='h-screen w-screen bg-slate-700 flex justify-center items-center'
    >
      <div
        className='text-white bg-slate-800 py-6 px-8 rounded shadow-lg flex flex-col justify-between gap-2'
      >
        <h1>Oops!</h1>
        <p className='text-sm'>Sorry, an unexpected error has occurred.</p>
        <div 
        className='flex justify-center my-2'
        >
          <p>
            <i>{error.statusText || error.message}</i>
          </p>
        </div>

        <div
          className='flex justify-end'
        >
          <Link
            to={'/'}
            className='border-2 px-4 py-2 rounded'
          >Take me back...</Link>
        </div>
      </div>
    </div>
  );
}