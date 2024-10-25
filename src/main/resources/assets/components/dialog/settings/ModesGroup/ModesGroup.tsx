import {useMemo} from 'react';
import {useTranslation} from 'react-i18next';
import {twMerge} from 'tailwind-merge';

import {Mode, MODES} from '../../../../../lib/shared/modes';
import {IconName} from '../../../shared/Icon/Icon';
import RadioGroup from '../../../shared/RadioGroup/RadioGroup';

type Props = {
    className?: string;
    mode: Mode;
    label: string;
    group: string;
    handleChange: (mode: Mode) => void;
};

function getModelIcon(mode: Mode): IconName {
    switch (mode) {
        case 'precise':
            return 'codeBracket';
        case 'focused':
            return 'presentationChartLine';
        case 'balanced':
            return 'scale';
        case 'creative':
            return 'sparkles';
    }
}

export default function ModesGroup({className, mode, label, group, handleChange}: Props): JSX.Element {
    const {t} = useTranslation();

    const options = useMemo(
        () =>
            MODES.map(value => {
                return {
                    icon: getModelIcon(value),
                    name: t(`text.mode.${value}.name`),
                    description: t(`text.mode.${value}.description`),
                    value,
                };
            }),
        [],
    );

    return (
        <RadioGroup
            className={twMerge('ModesGroup max-w-4xl', className)}
            label={label}
            group={group}
            options={options}
            selectedValue={mode}
            handleChange={handleChange}
        />
    );
}
