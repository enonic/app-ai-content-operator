import {Trans} from 'react-i18next';

type Props = {
    name: string;
};

export default function GreetingMessagePhrase({name}: Props): React.ReactNode {
    const hours = new Date().getHours();
    const components = {
        name: (
            <span className='font-semibold italic' key='name'>
                {name}
            </span>
        ),
    };
    switch (true) {
        case hours < 6:
            return <Trans i18nKey='text.greeting.recurring.night' components={components} />;
        case hours < 12:
            return <Trans i18nKey='text.greeting.recurring.morning' components={components} />;
        case hours < 18:
            return <Trans i18nKey='text.greeting.recurring.afternoon' components={components} />;
        default:
            return <Trans i18nKey='text.greeting.recurring.evening' components={components} />;
    }
}
