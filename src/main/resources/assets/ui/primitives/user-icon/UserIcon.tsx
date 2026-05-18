import { useStore } from '@nanostores/react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

import { $config } from '@/store/config';

type Props = {
  className?: string;
};

export default function UserIcon({ className }: Props): React.ReactNode {
  const { user } = useStore($config, { keys: ['user'] });
  return (
    <div
      className={twMerge(
        clsx(
          'flex items-center justify-center',
          'h-8 w-8',
          'text-xs',
          'rounded-full',
          'text-white',
          'bg-black',
          className,
        ),
      )}
    >
      {user.shortName}
    </div>
  );
}
