declare namespace Slate {
    type MentionElement = {
        type: 'mention';
        character: string;
        children: CustomText[];
        path: string;
        title: string;
    };

    type ParagraphElement = {
        type: 'paragraph';
        children: (CustomText | MentionElement)[];
    };

    type CustomElement = MentionElement | ParagraphElement;

    type CustomText = {
        text: string;
    };
}
