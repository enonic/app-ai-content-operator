export type ConfigureEventData = {
    payload: {
        user?: {
            fullName: string;
            shortName: string;
        };
        instructions?: string;
    };
};
