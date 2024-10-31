import {Mention} from '../../../../../stores/data/Mention';
import ContextMessagePhrase from '../ContextMessagePhrase/ContextMessagePhrase';
import GreetingMessagePhrase from '../GreetingMessagePhrase/GreetingMessagePhrase';

type Props = {
    name: string;
    topic: string;
    mentionInContext: Optional<Mention>;
};

export default function WelcomeMessagePhrase({name, topic, mentionInContext}: Props): React.ReactNode {
    return (
        <>
            <GreetingMessagePhrase name={name} />
            <ContextMessagePhrase topic={topic} mentionInContext={mentionInContext} />
        </>
    );
}
