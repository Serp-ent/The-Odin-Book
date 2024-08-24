import './index.css'
import Header from './Header';
import Aside from './Aside';

function App() {
  return (
    <div
      className='h-screen grid grid-rows-[auto_10fr] grid-cols-[5fr_2fr]'
    >
      <Header />
      <main
        className='bg-gray-700'
      >
      </main>

      <Aside />
    </div>
  );
}

export default App
