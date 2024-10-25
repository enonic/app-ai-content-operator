import {twMerge} from 'tailwind-merge';

import SettingsContent from '../SettingsContent/SettingsContent';

export interface Props {
    className?: string;
}

export default function SettingsContainer({className}: Props): JSX.Element {
    return (
        <div className={twMerge('SettingsContainer grid grid-rows-fit-1fr gap-3 py-4', className)}>
            <SettingsContent />
        </div>
    );
}
