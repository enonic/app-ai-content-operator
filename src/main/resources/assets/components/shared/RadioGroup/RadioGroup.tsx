import {twMerge} from 'tailwind-merge';

import {IconNameOrOptions} from '../Icon/Icon';
import RadioOption from '../RadioOption/RadioOption';

type Props<T extends string> = {
    className?: string;
    label?: string;
    group: string;
    options: RadioOptionConfig<T>[];
    selectedValue?: string;
    handleChange: (value: T) => void;
};

export type RadioOptionConfig<T extends string> = {
    name?: string;
    description?: string;
    icon: IconNameOrOptions;
    value: T;
};

export default function RadioGroup<T extends string>({
    className,
    label,
    group,
    options,
    selectedValue,
    handleChange,
}: Props<T>): React.ReactNode {
    return (
        <fieldset className={twMerge('grid grid-cols-min-280', className)}>
            {label && <legend className='font-bold capitalize text-base pb-2'>{label}</legend>}
            {options.map(({icon, name, description, value}, index) => (
                <RadioOption
                    key={index}
                    icon={icon}
                    group={group}
                    name={name ?? value}
                    description={description}
                    value={value}
                    changeHandler={handleChange}
                    checked={value === selectedValue}
                />
            ))}
        </fieldset>
    );
}
