import Link from 'next/link';

interface SidebarProps {
  isOpen: boolean;
  toggle: () => void;
}

export const Sidebar = (props: SidebarProps) => {
  const { isOpen, toggle } = props;

  return (
    <>
      <div
        className='sidebar-container fixed left-0 z-40 grid h-full w-full justify-center overflow-hidden bg-white pt-[120px]'
        style={{
          opacity: `${isOpen ? '1' : '0'}`,
          top: ` ${isOpen ? '0' : '-100%'}`,
        }}
      >
        <button className='absolute right-0 p-5' onClick={toggle}>
          {/* Close icon */}
          <svg
            xmlns='http://www.w3.org/2000/svg'
            width='48'
            height='48'
            viewBox='0 0 24 24'
          >
            <path
              fill='currentColor'
              d='M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z'
            />
          </svg>
        </button>

        <ul className='sidebar-nav text-center text-xl leading-relaxed'>
          <li>
            <Link href='/' onClick={toggle}>
              <h3>Start</h3>
            </Link>
          </li>

          <li>
            <Link href='/alternating' onClick={toggle}>
              <h3>Opieka</h3>
            </Link>
          </li>
          <li>
            <Link href='/settings' onClick={toggle}>
              <h3>Ustawienia</h3>
            </Link>
          </li>
          <li>
            <Link href='/help' onClick={toggle}>
              <h3>Help</h3>
            </Link>
          </li>
        </ul>
      </div>
    </>
  );
};
