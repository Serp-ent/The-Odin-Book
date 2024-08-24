import odinIcon from './assets/odin-icon.svg';
import './index.css'

export default function Header() {
  return (
    <header
      className='py-2 px-4 bg-gray-900 col-span-2 flex items-center justify-between text-white'
    >
      <div>
        <a 
        className='flex justify-center items-center gap-4' 
        href='/'>
          <img src={odinIcon} />
          <h1 className='font-bold text-3xl'>The Odin Book</h1>
        </a>
      </div>

      <div className='flex gap-4 items-center'>
        <div>Ben Thomson</div>
        <button
          className='py-2 px-4 rounded-lg border-2 border-white'
        >Log out</button>
      </div>
    </header>);
}