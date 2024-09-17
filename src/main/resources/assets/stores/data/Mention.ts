export type Mention = {
    path: string;
    prettified: string;
    label: string;
    type?: MentionType;
};

export type MentionType = 'scope' | 'normal';
