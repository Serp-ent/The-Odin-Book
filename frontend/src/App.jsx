import './index.css'
import Header from './Header';

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
      <aside
        className='bg-slate-400'
      >
      </aside>
    </div>
  );
}

export default App
