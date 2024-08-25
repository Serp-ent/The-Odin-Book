import Aside from '../Aside';
import Header from '../Header';
import '../index.css'
import MainSection from '../MainSection';

function Root() {
  return (
    <div
      className='h-screen grid grid-rows-[auto_10fr] grid-cols-[5fr_2fr]'
    >
      <Header />
      <MainSection />
      <Aside />
    </div>
  );
}

export default Root
