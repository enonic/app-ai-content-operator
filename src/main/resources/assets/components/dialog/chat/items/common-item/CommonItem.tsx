import { twMerge } from 'tailwind-merge';

import type { MultipleValues } from '@/store/content';

import { combineValues } from '../../../../../common/messages';
import CommonItemContent from '../common-item-content/CommonItemContent';

type Props = {
  className?: string;
  last: boolean;
  value: Optional<string | MultipleValues>;
};

export default function CommonItem({ className, last, value }: Props): React.ReactNode {
  return (
    <li className={twMerge('grid grid-cols-1 gap-y-1', className)}>
      <CommonItemContent content={value && combineValues(value)} last={last} />
    </li>
  );
}
