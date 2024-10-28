import AssistantDialog from '../dialog/AssistantDialog/AssistantDialog';
import LaunchButton from '../LaunchButton/LaunchButton';

export default function App(): React.ReactNode {
    return (
        <>
            <LaunchButton />
            <AssistantDialog />
        </>
    );
}
