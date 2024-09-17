import clsx from 'clsx';

import SettingsContent from '../SettingsContent/SettingsContent';

export interface Props {
    className?: string;
}

export default function SettingsContainer({className}: Props): JSX.Element {
    return (
        <div className={clsx(['SettingsContainer', 'grid grid-rows-fit-1fr gap-3', 'py-4', className])}>
            <SettingsContent />
        </div>
    );
}
