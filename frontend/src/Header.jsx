import odinIcon from './assets/odin-icon.svg';
import './index.css'

export default function Header() {
  return (
    <header
      className='py-2 px-4 bg-gray-900 col-span-2 flex items-center justify-between text-white'
    >
      <div>
        <img src={odinIcon} />
      </div>

      <div className='flex gap-4 items-center'>
        <div>Ben Thomson</div>
        <button
        className='py-2 px-4 rounded-lg border-2 border-white'
        >Log out</button>
      </div>
    </header>);
}