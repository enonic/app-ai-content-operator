import { atom } from 'nanostores';

import type { LicenseState } from '@shared/license';

export const $licenseState = atom<Optional<LicenseState>>(null);
export const $initialized = atom<boolean>(false);
