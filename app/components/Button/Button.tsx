import { PropsWithChildren } from 'react';
import '../../globals.css';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  PropsWithChildren &
  JSX.IntrinsicAttributes;

export const Button = (props: ButtonProps) => {
  const { children, ...restProps } = props;
  return (
    <button
      {...restProps}
      className='max-w-96 flex-none cursor-pointer rounded-md bg-sky-900 px-3 py-3.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-sky-700 dark:bg-gray-800 dark:text-white/40 dark:shadow-none'
    >
      {children}
    </button>
  );
};
