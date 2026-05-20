import { useStore } from '@nanostores/react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { $config } from '@/store/config';

const GREETING_TEXT_NAME = 'GreetingText';
const GREETING_VARIATIONS = 3;

type TimeBucket = 'night' | 'morning' | 'afternoon' | 'evening';

const getTimeBucket = (hours: number): TimeBucket => {
  if (hours < 6) return 'night';
  if (hours < 12) return 'morning';
  if (hours < 18) return 'afternoon';
  return 'evening';
};

const getFirstName = (displayName: string): string => displayName.trim().split(/\s+/)[0] ?? '';

export const GreetingText = (): React.ReactNode => {
  const { t } = useTranslation();
  const { user } = useStore($config, { keys: ['user'] });

  const variation = useMemo(() => Math.floor(Math.random() * GREETING_VARIATIONS), []);
  const bucket = getTimeBucket(new Date().getHours());

  const firstName = user?.displayName ? getFirstName(user.displayName) : '';
  const key = `text.greeting.${bucket}.${variation}`;

  return firstName ? t(key, { name: firstName }) : t(key, { context: 'anon' });
};
GreetingText.displayName = GREETING_TEXT_NAME;
