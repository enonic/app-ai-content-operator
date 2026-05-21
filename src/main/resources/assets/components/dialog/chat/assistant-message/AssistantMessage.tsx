import { Avatar, cn } from '@enonic/ui';

import { JukeIcon } from '@/ui/primitives/juke-icon/JukeIcon';

import type { ModelChatMessage, ModelChatMessageContent } from '@/store/content';

import { AssistantMessageList } from '../assistant-message-list/AssistantMessageList';
import { AssistantMessagePlaceholder } from '../assistant-message-placeholder/AssistantMessagePlaceholder';
import { ResponseControls } from '../controls/response-controls/ResponseControls';

const ASSISTANT_MESSAGE_NAME = 'AssistantMessage';

export type AssistantMessageProps = {
  className?: string;
  message: ModelChatMessage;
  last: boolean;
};

const hasGenerationResult = (
  content: ModelChatMessageContent,
): content is Required<ModelChatMessageContent> => {
  return content.generationResult != null;
};

export const AssistantMessage = ({
  className,
  message,
  last,
}: AssistantMessageProps): React.ReactNode => {
  const { id: messageId, content } = message;
  const isGenerating = !hasGenerationResult(content);

  return (
    <section
      data-component={ASSISTANT_MESSAGE_NAME}
      className={cn(ASSISTANT_MESSAGE_NAME, 'grid-cols-fit-1fr grid gap-x-4', className)}
    >
      <Avatar.Root size="md" shape="circle" className="bg-transparent">
        <Avatar.Fallback className="bg-transparent p-0">
          <JukeIcon className="size-full" />
        </Avatar.Fallback>
      </Avatar.Root>
      <article className="flex flex-1 flex-col text-sm text-pretty">
        {isGenerating ? (
          <AssistantMessagePlaceholder content={content} />
        ) : (
          <>
            <AssistantMessageList messageId={messageId} content={content} last={last} />
            <ResponseControls className='mt-5' message={message} last={last} />
          </>
        )}
      </article>
    </section>
  );
};
AssistantMessage.displayName = ASSISTANT_MESSAGE_NAME;
