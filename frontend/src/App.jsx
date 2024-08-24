import './index.css'
import Header from './Header';
import Aside from './Aside';
import Main from './Main';

function App() {
  return (
    <div
      className='h-screen grid grid-rows-[auto_10fr] grid-cols-[5fr_2fr]'
    >
      <Header />
      <Main />
      <Aside />
    </div>
  );
}

export default App
